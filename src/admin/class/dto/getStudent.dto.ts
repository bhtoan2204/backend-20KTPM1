import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsInt, Min, Max, IsNotEmpty, IsString } from 'class-validator';
import { IsValidObjectId } from 'src/utils/customValidator/isValidObjectId.validator';

export class GetStudentDto {
    @ApiProperty({
        description: 'Class id'
    })
    @IsNotEmpty()
    @IsString()
    @IsValidObjectId()
    class_id: string;

    @ApiProperty({
        description: 'Page number'
    })
    @IsOptional()
    @IsInt()
    @Min(1, { message: 'Page should be greater than 0' })
    page?: number;

    @ApiProperty({
        description: 'Item per page'
    })
    @IsOptional()
    @IsInt()
    @Min(5, { message: 'PerPage should be greater than or equal to 5' })
    @Max(20, { message: 'PerPage should be less than or equal to 20' })
    itemPerPage?: number;
}
