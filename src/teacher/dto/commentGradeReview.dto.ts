import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { IsValidObjectId } from "src/utils/customValidator/isValidObjectId.validator";

export class CommentGradeReviewDto {
    @ApiProperty({
        description: 'Grade review id'
    })
    @IsNotEmpty()
    @IsString()
    @IsValidObjectId()
    grade_review_id: string;

    @ApiProperty({
        description: 'Comment',
        example: 'Good job!'
    })
    @IsNotEmpty()
    @IsString()
    comment: string;
}
