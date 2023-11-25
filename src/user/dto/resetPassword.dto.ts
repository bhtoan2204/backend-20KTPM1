import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @ApiProperty()
    email: string;

    @IsNumber()
    @ApiProperty()
    otp: number;

    @ApiProperty({
        description: 'Password of the user',
        example: 'Password123',
    })
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'password too weak',
    })
    password: string;

    @ApiProperty({
        description: 'Rewrite your password',
        example: 'Password123',
    })
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    rewrite_password: string;
}
