import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

export class GoogleAuthGuard extends AuthGuard('google') {
    constructor(private configService: ConfigService) {
        super({
            accessType: 'offline',
        });
    }
}
