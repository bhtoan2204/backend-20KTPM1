import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Status } from "src/utils/enum/status.enum";

export class MarkFinalDescistionDto {
    @ApiProperty({
        description: 'Grade review id'
    })
    @IsNotEmpty()
    @IsString()
    grade_review_id: string;

    @ApiProperty({
        description: 'approved or rejected',
        example: 'Pass'
    })
    @IsEnum(Status)
    status: Status;

    @ApiProperty({
        description: 'Updated grade',
        example: 19
    })
    updatedGrade: number;
}