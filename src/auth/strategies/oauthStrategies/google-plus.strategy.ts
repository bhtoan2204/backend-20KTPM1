import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(UserService) private readonly userService: UserService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { name, emails, photos } = profile;
      const user = {
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        picture: photos[0].value,
        accessToken,
        refreshToken,
      };

      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }
}
