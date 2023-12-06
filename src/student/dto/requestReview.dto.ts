import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { IsValidObjectId } from "src/utils/customValidator/isValidObjectId.validator";

export class RequestReviewDto {
    @IsNotEmpty()
    @IsString()
    @IsValidObjectId()
    class_id: string;

    @IsNotEmpty()
    @IsString()
    gradeCompo_name: string;

    @IsString()
    @IsNumber()
    expected_grade: string;

    @IsNotEmpty()
    explaination: string;
}