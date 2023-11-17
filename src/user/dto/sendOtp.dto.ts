import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class sendOTPDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @ApiProperty()
    email: string;
}
