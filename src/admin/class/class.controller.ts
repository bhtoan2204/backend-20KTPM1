import { Body, Controller, Get, Param, Patch, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/utils/decorator/role.decorator";
import { Role } from "src/utils/enum/role.enum";
import { JwtAuthGuard } from "src/utils/guard/authenticate/jwt-auth.guard";
import { RolesGuard } from "src/utils/guard/authorize/role.guard";
import { ClassAdminService } from "./class.service";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { GetClassesFilterDto } from "./dto/getClassFilter.dto";
import { GetStudentDto } from "./dto/getStudent.dto";
import { MapStudentDto } from "./dto/mapStudent.dto";

@Controller('class')
@ApiTags('Class for Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ClassAdminController {
    constructor(
        private readonly classAdminService: ClassAdminService,
    ) { }

    @UseInterceptors(CacheInterceptor)
    @Post('/getClasses')
    @ApiOperation({ summary: 'Get classes' })
    async getClasses(@Body() dto: GetClassesFilterDto) {
        return this.classAdminService.getClasses(dto);
    }

    @UseInterceptors(CacheInterceptor)
    @Post('/getTeachers')
    @ApiOperation({ summary: 'Get teachers' })
    async getTeachers(@Body() dto: GetStudentDto) {
        return this.classAdminService.getTeachers(dto.class_id, dto.page, dto.itemPerPage);
    }

    @UseInterceptors(CacheInterceptor)
    @Post('/getStudents')
    @ApiOperation({ summary: 'Get students' })
    async getStudents(@Body() dto: GetStudentDto) {
        return this.classAdminService.getStudents(dto.class_id, dto.page, dto.itemPerPage);
    }

    @UseInterceptors(CacheInterceptor)
    @Get('/getClassDetail/:classId')
    @ApiParam({ name: 'classId', type: String })
    @ApiOperation({ summary: 'Get class detail' })
    async getClassDetail(@Param() params: any) {
        return this.classAdminService.getClassDetail(params.classId);
    }

    @Patch('/activateClass/:classId')
    @ApiParam({ name: 'classId', type: String })
    @ApiOperation({ summary: 'Activate class' })
    async activateClass(@Param() params: any) {
        return this.classAdminService.activateClass(params.classId);
    }

    @Patch('/manualMapStudentId')
    @ApiOperation({ summary: 'Manual map student id' })
    async manualMapStudentId(@Body() dto: MapStudentDto) {
        return this.classAdminService.manualMapStudentId(dto.class_id, dto.user_id, dto.student_id);
    }
}