import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('')
@Controller('')
export class AppController {
    getHello() {
        return 'Hello World';
    }
}
