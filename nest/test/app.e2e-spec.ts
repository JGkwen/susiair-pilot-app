import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.JWT_SECRET ??= 'e2e-test-secret';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  const login = (body: object) =>
    request(app.getHttpServer()).post('/auth/login').send(body);

  it('GET /health is public', () =>
    request(app.getHttpServer()).get('/health').expect(200, { status: 'ok' }));

  it('POST /auth/login returns a bearer token for the pilot account', async () => {
    const res = await login({ username: 'johndoe', password: 'susiairtest' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      accessToken: expect.any(String),
      tokenType: 'Bearer',
      expiresIn: 43200,
    });
  });

  it('POST /auth/login rejects wrong credentials with the standard error shape', async () => {
    const res = await login({ username: 'johndoe', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid username or password',
      path: '/auth/login',
      timestamp: expect.any(String),
    });
  });

  it('POST /auth/login validates the body', async () => {
    const res = await login({ username: '' });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      message: expect.arrayContaining([
        'username should not be empty',
        'password must be a string',
      ]),
    });
  });

  it('GET /pilot/me returns 401 without a token', async () => {
    const res = await request(app.getHttpServer()).get('/pilot/me');
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ statusCode: 401, path: '/pilot/me' });
  });

  it('GET /pilot/me returns 401 with an invalid token', () =>
    request(app.getHttpServer())
      .get('/pilot/me')
      .set('Authorization', 'Bearer not-a-real-token')
      .expect(401));

  it('GET /pilot/me returns the profile with a valid token', async () => {
    const { body } = await login({
      username: 'johndoe',
      password: 'susiairtest',
    });
    const res = await request(app.getHttpServer())
      .get('/pilot/me')
      .set(
        'Authorization',
        `Bearer ${(body as { accessToken: string }).accessToken}`,
      );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      name: 'John Doe',
      totalFlightHours: 1444.5,
      avatarUrl: '/avatar-placeholder.svg',
      asOf: '2026-05-15',
    });
  });
});
