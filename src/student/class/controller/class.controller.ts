import { Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { ClassService } from "../service/class.service";
import { JwtAuthGuard } from "src/auth/guards/AuthGuard/jwt-auth.guard";
import { RolesGuard } from "src/utils/authorize/role.guard";
import { Roles } from "src/utils/decorator/role.decorator";
import { Role } from "src/utils/enum/role.enum";
import { CurrentUser } from "src/utils/decorator/current-user.decorator";
import { ApiOperation, ApiParam } from "@nestjs/swagger";

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
export class ClassController {
    constructor(
        private readonly classService: ClassService
    ) { }

    @HttpCode(HttpStatus.CREATED)
    @Post('joinClassByCode/:classId')
    @ApiOperation({ summary: 'Join class' })
    @ApiParam({ name: 'classId', type: String })
    async joinClassByCode(@CurrentUser() user, @Param() params: any) {
        return this.classService.joinClassByCode(user, params.classId);
    }

    @HttpCode(HttpStatus.OK)
    @Post('/joinClassByLink/:classToken/:classId')
    @ApiOperation({ summary: 'Join class' })
    @ApiParam({ name: 'classToken', type: String })
    @ApiParam({ name: 'classId', type: String })
    async joinClassByLink(@CurrentUser() user, @Param() params: any) {
        return this.classService.joinClass(user, params.classToken, params.classId);
    }

    @HttpCode(HttpStatus.OK)
    @Get('/getJoinedClasses')
    @ApiOperation({ summary: 'Get joined classes' })
    async getJoinedClasses(@CurrentUser() user) {
        return this.classService.getJoinedClasses(user);
    }

    @HttpCode(HttpStatus.OK)
    @Get('getGradeStructure/:classId')
    @ApiOperation({ summary: 'Get grade structure' })
    async viewGradeStructure(@CurrentUser() user, @Param() params: any) {
        return this.classService.viewGradeStructure(user, params.classId);
    }

    @HttpCode(HttpStatus.OK)
    @Get('viewClassMembers/:classId')
    @ApiOperation({ summary: 'View class members' })
    async viewClassMembers(@CurrentUser() user, @Param() params: any) {
        return this.classService.viewClassMembers(user, params.classId);
    }

}