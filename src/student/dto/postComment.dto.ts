import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class PostCommentDto {
    @IsNotEmpty()
    @IsString()
    gradeReview_id: string;

    @IsNotEmpty()
    @IsString()
    content: string;
}