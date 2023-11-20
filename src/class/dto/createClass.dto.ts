import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateClassDto {
    @ApiProperty({
        description: 'Class name',
        example: "Physics II",
    })
    @IsNotEmpty()
    @IsString()
    className: string;

    @ApiProperty({
        description: 'Description',
        example: 'This is a Physics II class',
    })
    @IsString()
    description: string;

}
