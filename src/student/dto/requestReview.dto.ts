import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class RequestReviewDto {
    @IsNotEmpty()
    @IsString()
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