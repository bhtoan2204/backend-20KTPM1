import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RemoveGradeCompositionDto {
    @ApiProperty({
        description: 'Class id'
    })
    @IsNotEmpty()
    @IsString()
    class_id: string;

    @ApiProperty({
        description: 'Name of the grade composition',
        example: 'Quiz 1',
    })
    @IsNotEmpty()
    @IsString()
    name: string;
}
