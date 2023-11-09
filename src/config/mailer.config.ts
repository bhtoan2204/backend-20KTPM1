import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const mailerConfig: MailerOptions = {
  transport: 'smtps://user@domain.com:pass@smtp.domain.com',
  template: {
    dir: './src/templates/',
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
};
