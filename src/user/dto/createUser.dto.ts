import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'example@gmail.com',
  })
  @IsString({
    message: 'Email must be a string',
  })
  email: string;

  @ApiProperty({
    description: 'Fullname of the user',
    example: 'John Doe',
  })
  @IsString({
    message: 'Full name must be a string',
  })
  fullname: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'password123',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @ApiProperty({
    description: 'Birthday of the user',
    example: '2000-01-01',
  })
  @IsDateString()
  birthday: Date;

  @ApiProperty({
    description: 'Role of the user',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty({
    message: 'Role is required',
  })
  role: string;
}
