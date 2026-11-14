import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  API_DOCS_PATH,
  API_GLOBAL_PREFIX,
  API_TITLE,
  API_VERSION,
  DEFAULT_PORT,
} from './config/app.constants';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.enableCors({ origin: configService.getOrThrow<string>('CORS_ORIGIN') });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const swaggerConfig = new DocumentBuilder().setTitle(API_TITLE).setVersion(API_VERSION).build();
  SwaggerModule.setup(API_DOCS_PATH, app, SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(configService.get<number>('PORT') ?? DEFAULT_PORT);
}

void bootstrap();
