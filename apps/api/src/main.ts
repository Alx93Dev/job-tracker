import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ACCESS_TOKEN_COOKIE } from './auth/auth.constants';
import { API_DOCS_PATH, API_GLOBAL_PREFIX, API_TITLE, API_VERSION } from './config/app.constants';
import type { EnvironmentVariables } from './config/environment.validation';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);

  // The web app proxies /api through Next.js, so the client IP used for rate limiting
  // comes from X-Forwarded-For and only the configured number of proxy hops is trusted.
  app.set('trust proxy', configService.get('TRUSTED_PROXY_HOPS', { infer: true }));
  app.use(cookieParser());
  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', { infer: true }),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle(API_TITLE)
    .setVersion(API_VERSION)
    .addCookieAuth(ACCESS_TOKEN_COOKIE)
    .build();
  SwaggerModule.setup(API_DOCS_PATH, app, SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(configService.get('PORT', { infer: true }));
}

void bootstrap();
