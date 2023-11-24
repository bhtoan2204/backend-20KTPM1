import { Controller, Get, HttpCode, HttpStatus, Param, UseGuards, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiParam, ApiTags } from "@nestjs/swagger";
import { GradeService } from "../grade.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CurrentUser } from "src/auth/decorator/current-user.decorator";

@ApiTags('gradeManagement')
@Controller('gradeManagement')
@ApiBearerAuth()
export class GradeManagementController {
    constructor(
        private readonly gradeService: GradeService
    ) { }

    @HttpCode(HttpStatus.OK)
    //@UseGuards(JwtAuthGuard)
    @ApiParam({ name: 'classId', type: String })
    @Get('/downloadListStudent/:classId/')
    async downloadListStudentCsv(@CurrentUser() user, @Param() params: any, @Res() res) {
        return this.gradeService.downloadListStudentCsv(user, params.classId, res);
    }

}