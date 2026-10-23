import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { SummaryResponseDto } from '../src/flight-hours/dto/summary.dto';

describe('API (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  const login = (body: object) =>
    request(app.getHttpServer()).post('/auth/login').send(body);

  const getWithToken = (path: string) =>
    request(app.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${accessToken}`);

  beforeAll(async () => {
    process.env.JWT_SECRET ??= 'e2e-test-secret';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    const { body } = await login({
      username: 'johndoe',
      password: 'susiairtest',
    });
    accessToken = (body as { accessToken: string }).accessToken;
  });

  afterAll(() => app.close());

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

  it.each([
    '/pilot/me',
    '/flight-hours?from=2026-05-01&to=2026-05-15',
    '/flight-hours/summary',
    '/documents',
    '/schedules?year=2026&month=5',
  ])('GET %s returns 401 without a token', async (path) => {
    const res = await request(app.getHttpServer()).get(path);
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Missing bearer token',
      path,
    });
  });

  it('GET /pilot/me returns 401 with an invalid token', () =>
    request(app.getHttpServer())
      .get('/pilot/me')
      .set('Authorization', 'Bearer not-a-real-token')
      .expect(401));

  it('GET /pilot/me returns the profile with a valid token', async () => {
    const res = await getWithToken('/pilot/me');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      name: 'John Doe',
      totalFlightHours: 1444.5,
      avatarUrl: '/avatar-placeholder.svg',
      asOf: '2026-05-15',
    });
  });

  it('GET /flight-hours/summary returns 15 points with today in the center', async () => {
    const res = await getWithToken('/flight-hours/summary');
    const { range, asOf, points } = res.body as SummaryResponseDto;
    expect(res.status).toBe(200);
    expect(range).toBe('1w');
    expect(points).toHaveLength(15);
    expect(points[7]).toMatchObject({ date: asOf, isFuture: false });
  });

  it.each(['5', '05'])(
    'GET /schedules accepts month=%s for May 2026',
    async (month) => {
      const res = await getWithToken(`/schedules?year=2026&month=${month}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ year: 2026, month: 5 });
    },
  );

  it('GET /flight-hours/summary rejects an unknown range with 400', async () => {
    const res = await getWithToken('/flight-hours/summary?range=2w');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: [
        'range must be one of the following values: 1w, 1m, 3m, 6m, 1y',
      ],
      path: '/flight-hours/summary?range=2w',
      timestamp: expect.any(String),
    });
  });
});
