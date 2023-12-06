import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { IsValidObjectId } from "src/utils/customValidator/isValidObjectId.validator";

export class MapStudentIdDto {
    @ApiProperty({
        description: 'Class id'
    })
    @IsNotEmpty()
    @IsString()
    @IsValidObjectId()
    class_id: string;

    @ApiProperty({
        description: 'User id'
    })
    @IsNotEmpty()
    @IsString()
    @IsValidObjectId()
    user_id: string;

    @ApiProperty({
        description: 'Student id',
    })
    @IsNotEmpty()
    @IsString()
    new_studentId: string;
}
