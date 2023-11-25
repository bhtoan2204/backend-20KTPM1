import { Module } from "@nestjs/common";
import { ClassModule } from "./class/class.module";
import { GradeModule } from "./grade/grade.module";
import { TeacherController } from "./teacher.controller";
import { TeacherService } from "./teacher.service";

@Module({
    imports: [ClassModule, GradeModule],
    controllers: [TeacherController],
    providers: [TeacherService],
})
export class TeacherModule { }