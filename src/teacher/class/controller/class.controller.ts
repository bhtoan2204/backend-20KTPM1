import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { ClassService } from "../service/class.service";
import { CreateClassDto } from "../dto/createClass.dto";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { JwtAuthGuard } from "src/auth/guards/AuthGuard/jwt-auth.guard";
import { CurrentUser } from "src/utils/decorator/current-user.decorator";
import { RolesGuard } from "src/utils/authorize/role.guard";
import { Roles } from "src/utils/decorator/role.decorator";
import { Role } from "src/utils/enum/role.enum";

@ApiTags('Class for Teacher')
@Controller('class')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
export class ClassController {
    constructor(
        private readonly classService: ClassService
    ) { }

    @HttpCode(HttpStatus.CREATED)
    @Post('/create')
    @ApiOperation({ summary: 'Create Class' })
    async create(@CurrentUser() host, @Body() dto: CreateClassDto) {
        return this.classService.create(host, dto);
    }

    @HttpCode(HttpStatus.OK)
    @UseInterceptors(CacheInterceptor)
    @Get('/getAll')
    @ApiOperation({ summary: 'Get all classes' })
    async getAll(@CurrentUser() host) {
        return this.classService.getAll(host);
    }

    @HttpCode(HttpStatus.OK)
    @Get('/classDetail/:classId')
    @ApiOperation({ summary: 'Get class detail' })
    @ApiParam({ name: 'classId', type: String })
    async getClassDetail(@CurrentUser() host, @Param() params: any) {
        return this.classService.getClassDetail(host, params.classId);
    }

    @Delete('/:classId')
    @ApiOperation({ summary: 'Delete class' })
    @ApiParam({ name: 'classId', type: String })
    async deleteClass(@CurrentUser() host, @Param() params: any) {
        return this.classService.deleteClass(host, params.classId);
    }

    @HttpCode(HttpStatus.OK)
    @UseInterceptors(CacheInterceptor)
    @Get('/getTeachers/:classId')
    @ApiOperation({ summary: 'Get teacher of class' })
    @ApiParam({ name: 'classId', type: String })
    async getTeacher(@CurrentUser() user, @Param() params: any) {
        return this.classService.getTeachers(user, params.classId);
    }

    @HttpCode(HttpStatus.OK)
    @UseInterceptors(CacheInterceptor)
    @Get('/getStudents/:classId')
    @ApiOperation({ summary: 'Get students of class' })
    @ApiParam({ name: 'classId', type: String })
    async getStudents(@CurrentUser() user, @Param() params: any) {
        return this.classService.getStudents(user, params.classId);
    }
}