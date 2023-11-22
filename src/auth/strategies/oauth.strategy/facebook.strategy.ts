import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-facebook";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
    constructor(
        //@Inject(UserService) private readonly userService: UserService,
        private readonly configService: ConfigService,
    ) {
        super({
            clientID: configService.get<string>("FACEBOOK_CLIENT_ID"),
            clientSecret: configService.get<string>("FACEBOOK_CLIENT_SECRET"),
            callbackURL: configService.get<string>("FACEBOOK_CALLBACK_URL"),
            fbGraphVersion: 'v3.0',
            profileFields: ["emails", "name"],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
    ): Promise<any> {
        console.log(profile);
        console.log(accessToken);
        console.log(refreshToken);
        // const { name, emails } = profile;
        // const user = {
        //     email: emails[0].value,
        //     firstName: name.givenName,
        //     lastName: name.familyName,
        // };
        // const payload = {
        //     user,
        //     accessToken,
        // };

        return profile;
    }
}