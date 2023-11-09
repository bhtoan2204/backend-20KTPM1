import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'random password' })
  password: string;
}
