import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: '617638375005-8ht50e9hb1robnqb8h9b96h6a4c4rum7.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: 'http://localhost:3000',
            scope: ['email', 'profile'],
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
        const { name, emails, photos } = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken,
            refreshToken
        }
        console.log(user)
        done(user);
    }
}