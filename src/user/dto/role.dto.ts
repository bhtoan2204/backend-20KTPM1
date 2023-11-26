import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";

enum UserRole {
    STUDENT = 'student',
    TEACHER = 'teacher',
}

export class RoleDto {
    @ApiProperty({ example: 'student' })
    @IsString()
    @IsEnum(UserRole)
    role: string;
}