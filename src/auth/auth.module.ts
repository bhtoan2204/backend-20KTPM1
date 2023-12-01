import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../utils/strategies/jwt.strategy';
import { LocalStrategy } from '../utils/strategies/local.strategy';
import { RefreshStrategy } from '../utils/strategies/refresh.strategy';
import { UserModule } from '../user/user.module';
import { GoogleStrategy } from '../utils/strategies/oauth.strategy/google-plus.strategy';
import { SessionSerializer } from '../utils/serializer/serializer';
import { FacebookStrategy } from '../utils/strategies/oauth.strategy/facebook.strategy';

@Module({
  imports: [
    PassportModule,
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
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshStrategy, GoogleStrategy, SessionSerializer, FacebookStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule { }
