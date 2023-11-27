import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { join } from 'path';
import { MailModule } from './mail/mail.module';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TeacherModule } from './teacher/teacher.module';
import { RouterModule } from '@nestjs/core';
import { ClassModule } from './teacher/class/class.module';
import { GradeModule } from './teacher/grade/grade.module';
import { StudentModule } from './student/student.module';
import { ClassStudentsModule } from './student/class/class.module';
import { GradeViewerModule } from './student/grade/grade.module';
import { AdminModule } from './admin/admin.module';
import { AccountsModule } from './admin/accounts/accounts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid(
          'development',
          'production',
        ),
        PORT: Joi.number().default(8080),
        SESSION_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.number().required(),
        JWT_SECRET: Joi.string().required(),
        REFRESH_EXPIRATION: Joi.number().required(),
        JWT_SECRET_REFRESH: Joi.string().required(),
        MONGO_URI: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_REFRESH_TOKEN: Joi.string().required(),
        GOOGLE_EMAIL: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string().required(),
        FACEBOOK_CLIENT_ID: Joi.string().required(),
        FACEBOOK_CLIENT_SECRET: Joi.string().required(),
        FACEBOOK_CALLBACK_URL: Joi.string().required(),
        AZURE_STORAGE_CONNECTION: Joi.string().required(),
        AZURE_STORAGE_CONTAINER: Joi.string().required(),
        ELASTICSEARCH_NODE: Joi.string().required(),
        ELASTICSEARCH_USERNAME: Joi.string().required(),
        ELASTICSEARCH_PASSWORD: Joi.string().required(),
        FRONTEND_URL: Joi.string().required(),
      }),
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    MailModule,
    UserModule,
    AuthModule,
    TeacherModule,
    StudentModule,
    AdminModule,
    PassportModule.register({ session: true }),
    CacheModule.register({
      isGlobal: true,
      ttl: 10,
      max: 10,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRoot({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
      template: {
        dir: join(__dirname, 'mail/templates/'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    RouterModule.register([
      {
        path: '',
        module: AdminModule,
        children: [
          {
            path: 'admin',
            module: AccountsModule,
          }
        ]
      },
      {
        path: '',
        module: TeacherModule,
        children: [
          {
            path: 'teacher',
            module: ClassModule,
          },
          {
            path: 'teacher',
            module: GradeModule,
          }
        ]
      },
      {
        path: '',
        module: StudentModule,
        children: [
          {
            path: 'student',
            module: ClassStudentsModule,
          },
          {
            path: 'student',
            module: GradeViewerModule,
          }
        ]
      }
    ])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
