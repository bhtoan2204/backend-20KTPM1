import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(private readonly usersService: UserService) {
        super({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        });
    }

    async validate(request: any) {
        return this.usersService.validateUser(request.body.username, request.body.password);
    }
}
