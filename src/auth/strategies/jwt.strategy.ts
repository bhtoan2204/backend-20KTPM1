import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interface/tokenPayload.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
        private readonly userService: UserService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: any) => {
                    const cookieHeader = request.headers.cookie || '';
                    const cookies = {};
                    cookieHeader.split(';').forEach(cookie => {
                        const parts = cookie.split('=');
                        const name = parts[0].trim();
                        const value = parts[1];
                        cookies[name] = value;
                    });
                    return cookies['accessToken'];
                }
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: TokenPayload) {
        return await this.userService.getUserById(payload.id)
    }
}