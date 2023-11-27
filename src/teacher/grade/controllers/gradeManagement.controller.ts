import { Controller, Get, HttpCode, HttpStatus, Param, UseGuards, Res, Header, Body, Post, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiParam, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/AuthGuard/jwt-auth.guard";
import { CurrentUser } from "src/utils/decorator/current-user.decorator";
import { GradeManagementService } from "../service/gradeManagement.service";

@ApiTags('Grade Management for Teacher')
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
        const result = await this.gradeManagementService.downloadListStudentTemplate(user, params.classId);
        res.download(`${result}`);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiParam({ name: 'classId', type: String })
    @Post('/uploadListStudent/:classId')
    async uploadListStudentCsv(@CurrentUser() user, @Param() params: any) {
        return this.gradeManagementService.uploadListStudentCsv(user, params.classId);
    }

    async showStudentsListxGradesBoard(@CurrentUser() user, @Param() params: any) {
        return this.gradeManagementService.showStudentsListxGradesBoard(user, params.classId);
    }

    async mapStudentIdWithGrade(@CurrentUser() user, @Param() params: any) { }

    async inputGradeForStudentAtSpecificAssignment(@CurrentUser() user, @Param() params: any) { }

    async downloadTemplateByAssignment(@CurrentUser() user, @Param() params: any) { }

    async uploadGradeByAssignment(@CurrentUser() user, @Param() params: any) { }

    async showTotalGradeColumn(@CurrentUser() user, @Param() params: any) { }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiParam({ name: 'classId', type: String })
    @Get('/exportGradeBoard/:classId')
    async exportGradeBoard(@CurrentUser() user, @Param() params: any) {
        const result = await this.gradeManagementService.exportGradeBoard(user, params.classId);
        return result
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Patch('/markGradeAsFinal/:classId/:gradeCompositionName')
    @ApiParam({ name: 'gradeCompositionName', type: String })
    @ApiParam({ name: 'classId', type: String })
    async markGradeAsFinal(@CurrentUser() user, @Param() params: any) {
        return this.gradeManagementService.markGradeCompositionAsFinal(user, params.gradeCompositionName, params.classId);
    }

}