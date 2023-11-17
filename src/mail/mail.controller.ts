import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mailing')
export class MailController {
    constructor(readonly mailingService: MailService) { }
    @Get('send-mail')
    public sendMail() {
        this.mailingService.sendMail();
    }
}