import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { IsValidObjectId } from "src/utils/customValidator/isValidObjectId.validator";

export class PostCommentDto {
    @IsNotEmpty()
    @IsString()
    @IsValidObjectId()
    gradeReview_id: string;

    @IsNotEmpty()
    @IsString()
    content: string;
}