/* eslint-disable @typescript-eslint/ban-types */
import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(
        @Inject(UserService) private readonly userService: UserService,
    ) {
        super();
    }

    serializeUser(user: User, done: Function) {
        done(null, user);
    }

    async deserializeUser(payload: any, done: Function) {
        const user = await this.userService.findUserById(payload.id);
        return user ? done(null, user) : done(null, null);
    }
}
