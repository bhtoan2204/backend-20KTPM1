import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';
import { Strategy } from 'passport-jwt';
import { TokenPayload } from 'src/auth/interface/tokenPayload.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, 'ws-jwt') {
    constructor(
        configService: ConfigService,
        private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: (req) => {
                const authHeader = req.handshake.headers.authorization;
                if (!authHeader) {
                    throw new WsException('Missing Authorization header');
                }
                return authHeader.split(' ')[1];
            },
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: TokenPayload) {
        return await this.userService.getUserById(payload._id);
    }
}
