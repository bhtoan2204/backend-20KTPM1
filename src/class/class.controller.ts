import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { ClassService } from "./class.service";
import { CurrentUser } from "src/auth/decorator/current-user.decorator";
import { CreateClassDto } from "./dto/createClass.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Request } from "express";

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
    @ApiParam({ name: 'classId', type: String })
    async getClassDetail(@CurrentUser() host, @Param() params: any) {
        return this.classService.getClassDetail(host, params.classId);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Get('/getTeachers/:classId')
    @ApiOperation({ summary: 'Get teacher of class' })
    @ApiParam({ name: 'classId', type: String })
    async getTeacher(@CurrentUser() user, @Param() params: any) {
        return this.classService.getTeachers(user, params.classId);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Get('/getStudents/:classId')
    @ApiOperation({ summary: 'Get students of class' })
    @ApiParam({ name: 'classId', type: String })
    async getStudents(@CurrentUser() user, @Param() params: any) {
        return this.classService.getStudents(user, params.classId);
    }

    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard)
    @Get('/getInvitations/:classId')
    @ApiOperation({ summary: 'Get invitations of class' })
    @ApiParam({ name: 'classId', type: String })
    async getInvitations(@CurrentUser() user, @Param() params: any, @Req() req: Request) {
        return this.classService.getInvitations(user, params.classId, req);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Get('/join/:classToken/:classId')
    @ApiOperation({ summary: 'Join class' })
    @ApiParam({ name: 'classToken', type: String })
    @ApiParam({ name: 'classId', type: String })
    async joinClass(@CurrentUser() user, @Param() params: any) {
        return this.classService.joinClassAsStudent(user, params.classToken, params.classId);
    }
}