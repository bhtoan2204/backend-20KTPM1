import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Options } from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        private configService: ConfigService
    ) { }

    private async setTransport() {
        const OAuth2 = google.auth.OAuth2;
        const oauth2Client = new OAuth2(
            this.configService.get('GOOGLE_CLIENT_ID'),
            this.configService.get('GOOGLE_CLIENT_SECRET'),
            'https://developers.google.com/oauthplayground'
        );

        oauth2Client.setCredentials({
            refresh_token: this.configService.get('GOOGLE_REFRESH_TOKEN'),
        });

        const accessToken = await new Promise((resolve, reject) => {
            oauth2Client.getAccessToken((err, token) => {
                if (err) {
                    reject('Failed to create access token');
                }
                resolve(token as string);
            });
        }).then((token) => token).catch((err) => { console.log(err); });

        console.log(accessToken)

        const config: Options = {
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: this.configService.get('GOOGLE_EMAIL'),
                clientId: this.configService.get('GOOGLE_CLIENT_ID'),
                clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET'),
                accessToken: 'ya29.a0AfB_byAZoHWTKdWYakwryuQF4ZvnfJo16rwx9XnbcP77eY8rFNsoI88PDUMI3Hf1Cm0hfXTY5SehPgTeQ5eier14JGJLHjCpLkr5O_b7W2Yl62dPQVzZ1-Xen0f6ULEgzAP6FAIXMIkDM_y7dCIell58axStKuTYxnjGaCgYKATsSARESFQGOcNnCXTIXP3MlHR74ULtUbrG76A0171',
            },
        };

        console.log(config)

        this.mailerService.addTransporter('gmail', config);
    }

    public async sendMail() {
        await this.setTransport();
        this.mailerService.sendMail({
            transporterName: 'gmail',
            to: 'banhhaotoan2002@gmail.com',
            from: 'mjkundta@gmail.com',
            subject: 'Testing Nest MailerModule ✔',
            template: 'action',
            context: {
                code: '38320'
            },
        })
            .then(success => {
                console.log(success)
            })
            .catch(err => {
                console.log(err)
            });
    }
}
