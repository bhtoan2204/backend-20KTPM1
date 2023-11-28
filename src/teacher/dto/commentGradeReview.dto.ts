import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CommentGradeReviewDto {
    @ApiProperty({
        description: 'Grade review id'
    })
    @IsNotEmpty()
    @IsString()
    grade_review_id: string;

    @ApiProperty({
        description: 'Comment',
        example: 'Good job!'
    })
    @IsNotEmpty()
    @IsString()
    comment: string;
}
