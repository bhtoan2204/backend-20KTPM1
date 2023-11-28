import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { GradeReviewService } from "../service/gradeReview.service";
import { CurrentUser } from "src/utils/decorator/current-user.decorator";
import { JwtAuthGuard } from "src/utils/guard/authenticate/jwt-auth.guard";
import { Roles } from "src/utils/decorator/role.decorator";
import { Role } from "src/utils/enum/role.enum";
import { RolesGuard } from "src/utils/guard/authorize/role.guard";
import { User } from "src/utils/schema/user.schema";
import { CommentGradeReviewDto } from "src/teacher/dto/commentGradeReview.dto";
import { MarkFinalDescistionDto } from "src/teacher/dto/markFinalDescistion.dto";

@ApiTags('Grade Review for Teacher')
@Controller('gradeReview')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
export class GradeReviewController {
    constructor(
        private readonly gradeService: GradeReviewService
    ) { }

    @HttpCode(HttpStatus.OK)
    @Get('/getGradeReview')
    @ApiOperation({ summary: 'Get grade review' })
    async viewGradeReview(@CurrentUser() currentUser: User) {
        return await this.gradeService.viewGradeReview(currentUser);
    }

    @HttpCode(HttpStatus.OK)
    @Get('/getGradeReviewDetail/:gradeReviewId')
    @ApiOperation({ summary: 'Get grade review detail' })
    @ApiParam({ name: 'gradeReviewId', type: String })
    async viewGradeReviewDetail(@CurrentUser() currentUser: User, @Param() params: any) {
        return await this.gradeService.viewGradeReviewDetail(currentUser, params.gradeReviewId);
    }

    @HttpCode(HttpStatus.OK)
    @Patch('/conmmentGradeReview')
    @ApiOperation({ summary: 'Comment grade review' })
    async commentGradeReview(@CurrentUser() currentUser: User, @Body() dto: CommentGradeReviewDto) {
        return await this.gradeService.commentGradeReview(currentUser, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Patch('/markFinalGrade')
    @ApiOperation({ summary: 'Mark final grade' })
    async markFinalGrade(@CurrentUser() user: User, @Body() dto: MarkFinalDescistionDto) {
        return await this.gradeService.markFinalGrade(user, dto);
    }
}