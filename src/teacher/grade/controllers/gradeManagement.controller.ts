import { Controller, Get, HttpCode, HttpStatus, Param, UseGuards, Res, Header, Body, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiParam, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/AuthGuard/jwt-auth.guard";
import { CurrentUser } from "src/auth/decorator/current-user.decorator";
import { GradeManagementService } from "../service/gradeManagement.service";

@ApiTags('gradeManagement')
@Controller('gradeManagement')
@ApiBearerAuth()
export class GradeManagementController {
    constructor(
        private readonly gradeManagementService: GradeManagementService
    ) { }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiParam({ name: 'classId', type: String })
    @Get('/downloadListStudent/:classId/')
    @Header('Content-Type', 'text/xlsx')
    async downloadListStudentCsv(@CurrentUser() user, @Param() params: any, @Res() res) {
        let result = await this.gradeManagementService.downloadListStudentCsv(user, params.classId);
        res.download(`${result}`);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Post('/uploadListStudent/:classId/')
    async uploadListStudentCsv(@CurrentUser() user, @Param() params: any, @Body() dto: any) { }

    async showStudentsListxGradesBoard(@CurrentUser() user, @Param() params: any) { }

    async mapStudentIdWithGrade(@CurrentUser() user, @Param() params: any) { }

    async inputGradeForStudentAtSpecificAssignment(@CurrentUser() user, @Param() params: any) { }

    async downloadTemplateByAssignment(@CurrentUser() user, @Param() params: any) { }

    async uploadGradeByAssignment(@CurrentUser() user, @Param() params: any) { }

    async showTotalGradeColumn(@CurrentUser() user, @Param() params: any) { }

    async exportGradeBoard(@CurrentUser() user, @Param() params: any) { }

    async markGradeAsFinal(@CurrentUser() user, @Param() params: any) { }

}