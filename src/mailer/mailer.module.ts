import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mailer.service';
import { ConfigService } from '@nestjs/config';
import { MailController } from './mailer.controller';

@Module({
    providers: [MailService, ConfigService],
    controllers: [MailController],
})
export class MailModule { }
