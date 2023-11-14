import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('')
@Controller('')
export class AppController {
    @Get()
    getHello() {
        return 'Hello World';
    }
}
