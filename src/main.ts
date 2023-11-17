import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
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
    origin: '*',
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

  setupSwagger(app);

  app.use(helmet());
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(configService.get<number>('PORT') || 8080);
}
bootstrap();
