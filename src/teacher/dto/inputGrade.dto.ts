import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class InputGradeDto {
    @ApiProperty({
        description: 'User id'
    })
    @IsNotEmpty()
    @IsString()
    user_id: string;

    @ApiProperty({
        description: 'Class id'
    })
    @IsNotEmpty()
    @IsString()
    class_id: string;

    @ApiProperty({
        description: 'Name of the grade composition',
    })
    @IsNotEmpty()
    @IsString()
    gradeCompo_name: string;

    @ApiProperty({
        description: 'Input grade of the grade composition',
    })
    @IsNotEmpty()
    @IsNumber()
    input_grade: number;
}
