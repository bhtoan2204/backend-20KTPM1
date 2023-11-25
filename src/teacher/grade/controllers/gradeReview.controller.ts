import { Controller } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { GradeReviewService } from "../service/gradeReview.service";

@ApiTags('gradeReview')
@Controller('gradeReview')
@ApiBearerAuth()
export class GradeReviewController {
    constructor(
        private readonly gradeService: GradeReviewService
    ) { }

    async viewGradeReview() { }

    async viewGradeReviewDetail() { }

    async commentGradeReview() { }

    async markFinalGrade() { }
}