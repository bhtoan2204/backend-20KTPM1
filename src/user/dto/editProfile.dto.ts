import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class EditProfileDTO {
    @ApiProperty({
        description: 'Fullname of the user',
        example: 'Michual Guay',
    })
    @IsString({
        message: 'Full name must be a string',
    })
    fullname: string;

    @ApiProperty({
        description: 'Birthday of the user',
        example: '2000-01-01',
    })
    @IsDateString()
    birthday: Date;
}
