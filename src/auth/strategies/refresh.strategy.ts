import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenPayload } from "../interface/tokenPayload.interface";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
    constructor(
        configService: ConfigService,
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
                    return cookies['refreshToken'];
                }
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET_REFRESH'),
        });
    }
    async validate(payload: TokenPayload) {
        return payload;
    }
}