import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { Role } from 'src/utils/enum/role.enum';

export class GetUserFilterDto {
    @ApiProperty({
        required: false,
        enum: [Role.TEACHER, Role.STUDENT, 'all'],
    })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @ApiProperty({
        required: false,
        type: Number,
        description: 'Page index (starting from 1)',
    })
    @IsOptional()
    @IsInt({ message: 'Page should be an integer greater than 0' })
    @Min(1, { message: 'Page should be greater than 0' })
    page?: number;

    @ApiProperty({
        required: false,
        type: Number,
        description: 'Items per page',
    })
    @IsOptional()
    @IsInt({ message: 'PerPage should be an integer' })
    @Min(5, { message: 'PerPage should be greater than or equal to 5' })
    @Max(20, { message: 'PerPage should be less than or equal to 20' })
    perPage?: number;
}
