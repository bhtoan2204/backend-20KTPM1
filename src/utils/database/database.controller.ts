import { Body, Controller, Post, Get, UseGuards, Req, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TokenPayload } from 'src/auth/interface/tokenPayload.interface';


@ApiTags('database')
@Controller('database')
export class DatabaseController {

    @Post('/none')
    @ApiOperation({ summary: 'None' })
    async create() {
        return { message: "hello from database" }
    }
}
