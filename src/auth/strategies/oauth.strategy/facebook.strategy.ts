import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-facebook";
import { UserService } from "src/user/service/user.service";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
    constructor(
        @Inject(UserService) private readonly userService: UserService,
        private readonly configService: ConfigService,
    ) {
        super({
            clientID: configService.get<string>("FACEBOOK_CLIENT_ID"),
            clientSecret: configService.get<string>("FACEBOOK_CLIENT_SECRET"),
            callbackURL: configService.get<string>("FACEBOOK_CALLBACK_URL"),
            // fbGraphVersion: 'v3.0',
            scope: ["email", "public_profile"],
            profileFields: ["id", "emails", "name", "picture.type(large)", "birthday"],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
    ): Promise<any> {
        try {
            return this.userService.validateFacebookUser(profile);
        }
        catch (error) {
            throw new UnauthorizedException('Credentials are not valid');
        }
    }
}