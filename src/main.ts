import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { setupSwagger } from './utils/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true
    })
  )

  app.enableCors({
    origin: '*',
    credentials: true
  })

  setupSwagger(app);

  app.use(helmet())

  await app.listen(configService.get('PORT'));
}
bootstrap();
