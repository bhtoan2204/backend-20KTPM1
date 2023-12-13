import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { IsValidObjectId } from "src/utils/customValidator/isValidObjectId.validator";

export class MapStudentIdDto {
    @IsNotEmpty()
    @IsString()
    @IsValidObjectId()
    class_id: string;

    @IsNotEmpty()
    @IsString()
    new_studentId: string;
}