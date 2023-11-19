import { Module, Session } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { UserModule } from '../user/user.module';
import { GoogleStrategy } from './strategies/oauth.strategy/google-plus.strategy';
import { SessionSerializer } from '../utils/serializer/serializer';
import { MongooseModule } from '@nestjs/mongoose';
import { ResetOtpSchema } from './schema/resetOtp.schema';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([{ name: 'ResetOtp', schema: ResetOtpSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION')}s`,
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    MailModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshStrategy, GoogleStrategy, SessionSerializer],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule { }
