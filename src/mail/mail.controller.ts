import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mailing')
export class MailController {
    constructor(readonly mailingService: MailService) { }
    @Get('send-mail-test')
    public sendMail() {
        this.mailingService.sendMail();
    }
}