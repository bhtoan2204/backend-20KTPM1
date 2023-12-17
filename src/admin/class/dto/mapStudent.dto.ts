import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidObjectId } from 'src/utils/customValidator/isValidObjectId.validator';

export class MapStudentDto {
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
        description: 'Student id'
    })
    @IsNotEmpty()
    @IsString()
    student_id: string;
}
