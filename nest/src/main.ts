import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const origins = (config.get<string>('CORS_ORIGIN') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (origins.length === 0) {
    Logger.warn(
      'CORS_ORIGIN is not set, so browsers on other origins are blocked',
      'Bootstrap',
    );
  }
  app.enableCors({
    origin: origins,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(config.get<string>('PORT') ?? 3000);
}
void bootstrap();
