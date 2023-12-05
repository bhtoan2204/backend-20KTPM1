import { INestApplication, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TeacherModule } from './teacher/teacher.module';
import { StudentModule } from './student/student.module';
import { AdminModule } from './admin/admin.module';
import { NotificationModule } from './notifications/notification.module';
import { RouteModule } from './route/route.module';
import { validateSchemaConfig } from './utils/config/validateSchema.config';
import { DatabaseModule } from './database/database.module';
import { LocalCacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: validateSchemaConfig,
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    MailModule,
    UserModule,
    AuthModule,
    TeacherModule,
    StudentModule,
    AdminModule,
    NotificationModule,
    PassportModule.register({ session: true }),
    RouteModule,
    //LocalCacheModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static port: number | string;
  constructor(private configService: ConfigService) {
    AppModule.port = configService.get('PORT') || 8080;
  }
  static getBaseUrl(app: INestApplication): string {
    let baseUrl = app.getHttpServer().address().address;
    if (baseUrl == '0.0.0.0' || baseUrl == '::') {
      return (baseUrl = 'localhost');
    }
  }
}
