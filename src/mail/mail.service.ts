import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Options } from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        private configService: ConfigService,
    ) { }

    private async setTransport() {
        const OAuth2 = google.auth.OAuth2;
        const oauth2Client = new OAuth2(
            this.configService.get<string>('GOOGLE_CLIENT_ID'),
            this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
            'https://developers.google.com/oauthplayground',
        );

        oauth2Client.setCredentials({
            refresh_token: this.configService.get<string>('GOOGLE_REFRESH_TOKEN'),
        });

        const accessToken = await new Promise((resolve, reject) => {
            oauth2Client.getAccessToken((err, token) => {
                if (err) {
                    reject('Failed to create access token');
                }
                resolve(token);
            });
        }).catch((err) => { throw err; });

        const config: Options = {
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: this.configService.get('GOOGLE_EMAIL'),
                clientId: this.configService.get('GOOGLE_CLIENT_ID'),
                clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET'),
                accessToken: accessToken as string,
            },
        };

        this.mailerService.addTransporter('gmail', config);
    }

    public async sendMail() {
        await this.setTransport();
        this.mailerService
            .sendMail({
                transporterName: 'gmail',
                to: 'mjkundta@gmail.com',
                from: 'mjkundta@gmail.com',
                subject: 'Testing Nest MailerModule ✔',
                template: 'action',
                context: {
                    name: "Toan",
                    code: '38320',
                },
            })
            .then((success) => {
                return { message: 'success' };
            })
            .catch((err) => {
                throw err;
            });
    }

    public async sendOtp(email, otp, title) {
        await this.setTransport();
        this.mailerService
            .sendMail({
                transporterName: 'gmail',
                to: email,
                from: 'mjkundta@gmail.com',
                subject: title,
                template: 'action',
                context: {
                    code: otp,
                },
            })
            .then((success) => {
                return { message: 'success' };
            })
            .catch((err) => {
                throw err;
            });

    }
}