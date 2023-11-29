import { Controller, Get, HttpCode, HttpStatus, Param, UseGuards, Res, Header, Body, Post, Patch, UseInterceptors, UploadedFile } from "@nestjs/common";
import { ApiBearerAuth, ApiParam, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/utils/guard/authenticate/jwt-auth.guard";
import { CurrentUser } from "src/utils/decorator/current-user.decorator";
import { GradeManagementService } from "../service/gradeManagement.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { RolesGuard } from "src/utils/guard/authorize/role.guard";
import { Roles } from "src/utils/decorator/role.decorator";
import { Role } from "src/utils/enum/role.enum";
import { StorageService } from "src/storage/storage.service";

@ApiTags('Grade Management for Teacher')
@Controller('gradeManagement')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
export class GradeManagementController {
    constructor(
        private readonly gradeManagementService: GradeManagementService,
        private readonly storageService: StorageService
    ) { }

    @HttpCode(HttpStatus.OK)
    @ApiParam({ name: 'classId', type: String })
    @Get('/downloadListStudentTemplate/:classId/')
    @Header('Content-Type', 'text/xlsx')
    async downloadListStudentTemplate(@CurrentUser() user, @Param() params: any, @Res() res) {
        const result = await this.gradeManagementService.downloadListStudentTemplate(user, params.classId);
        res.download(`${result}`);
    }

    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('listStudent', {
        fileFilter: (req, file, callback) => {
            if (file.originalname.match(/\.(csv|xlsx)$/)) {
                return callback(null, true);
            }
            return callback(new Error('Only CSV or XLSX files are allowed!'), false);
        },
    }))
    @ApiParam({ name: 'classId', type: String })
    @Post('/uploadListStudent/:classId')
    async uploadListStudentCsv(@CurrentUser() user, @Param() params: any, @UploadedFile() file: Express.Multer.File) {
        return this.gradeManagementService.uploadListStudentCsv(user, params.classId, file);
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