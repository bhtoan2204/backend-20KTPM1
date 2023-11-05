import { Controller, Get } from '@nestjs/common';
import { MailService } from './mailer.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('mailing')
@Controller('mailing')
export class MailController {
    constructor(readonly mailingService: MailService) { }
    @Get('send-mail')
    public sendMail() {
        this.mailingService.sendMail();
    }
}