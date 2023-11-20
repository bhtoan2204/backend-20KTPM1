import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ClassService } from "./class.service";
import { CurrentUser } from "src/auth/decorator/current-user.decorator";
import { CreateClassDto } from "./dto/createClass.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { async } from "rxjs";

@ApiTags('class')
@Controller('class')
@ApiBearerAuth()
export class ClassController {
    constructor(
        private readonly classService: ClassService
    ) { }

    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard)
    @Post('/create')
    @ApiOperation({ summary: 'Create Class' })
    async create(@CurrentUser() host, @Body() dto: CreateClassDto) {
        return this.classService.create(host, dto);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Get('/getAll')
    @ApiOperation({ summary: 'Get all classes' })
    async getAll(@CurrentUser() host) {
        return this.classService.getAll(host);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Get('/classDetail/:classId')
    @ApiOperation({ summary: 'Get class detail' })
    async getClassDetail(@CurrentUser() host, @Param() params: any) {
        return this.classService.getClassDetail(host, params.classId);
    }
}