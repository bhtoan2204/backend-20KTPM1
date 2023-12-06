import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { setupSwagger } from './utils/swagger';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true
    })
  );

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL'),
    credentials: true
  });

  app.use(
    session({
      secret: configService.get<string>('SESSION_SECRET'),
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 60000,
      },
    }),
  );

  const logger = new Logger('Main')

  setupSwagger(app);

  app.use(helmet());
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(configService.get<number>('PORT') || 8080);
  const baseUrl = AppModule.getBaseUrl(app)
  const url = `http://${baseUrl}:${AppModule.port}`
  logger.log(`API Documentation available at ${url}`);
}
bootstrap();
