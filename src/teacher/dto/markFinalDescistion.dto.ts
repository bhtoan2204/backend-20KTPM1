import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { RealStatus } from "src/utils/enum/realStatus.enum";

export class MarkFinalDescistionDto {
    @ApiProperty({
        description: 'Grade review id'
    })
    @IsNotEmpty()
    @IsString()
    gradeReview_id: string;

    @ApiProperty({
        description: 'approved or rejected',
        example: 'Pass'
    })
    @IsEnum(RealStatus)
    status: RealStatus;
}