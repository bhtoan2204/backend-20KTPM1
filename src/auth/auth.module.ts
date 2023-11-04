import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entity/user.entity';
import { UserModule } from 'src/user/user.module';
import { RefreshToken } from './entity/refreshToken.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { DatabaseModule } from 'src/database/database.module';

@Module({
    imports: [
        DatabaseModule,
        TypeOrmModule.forFeature([RefreshToken]),
        PassportModule,
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: `${configService.get('JWT_EXPIRATION')}s`,
                },
            }),
            inject: [ConfigService],
        }),
        forwardRef(() => UserModule),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy, RefreshStrategy, JwtRefreshGuard],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }