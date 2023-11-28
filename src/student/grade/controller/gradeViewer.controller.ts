import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/utils/authorize/role.guard";
import { Roles } from "src/utils/decorator/role.decorator";
import { Role } from "src/utils/enum/role.enum";
import { GradeViewerService } from "../service/gradeViewer.service";
import { CurrentUser } from "src/utils/decorator/current-user.decorator";

@ApiTags('Grade for student')
@Controller('gradeViewer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class GradeViewerController {
    constructor(
        private readonly gradeViewerService: GradeViewerService
    ) { }

    @Get('viewGradeCompostitions/:classId')
    async viewGradeCompostitions(@CurrentUser() user, @Param() params: any) {
        return this.gradeViewerService.viewGradeCompostitions(user, params.classId);
    }

    async requestReview() { }

    async viewGradeReview() { }

    async letAComment() { }
}