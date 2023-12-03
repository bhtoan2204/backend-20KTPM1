import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SwapGradeCompositionDto {
    @ApiProperty({
        description: 'Class id'
    })
    @IsNotEmpty()
    @IsString()
    class_id: string;

    @ApiProperty({
        description: 'First name'
    })
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty({
        description: 'Second name'
    })
    @IsNotEmpty()
    @IsString()
    secondName: string;
}
