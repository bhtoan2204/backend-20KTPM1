import { Module } from "@nestjs/common";
import { StudentController } from "./student.controller";
import { ClassModule } from "./class/class.module";
import { StudentService } from "./student.service";
import { GradeViewerModule } from "./grade/grade.module";

@Module({
    imports: [ClassModule, GradeViewerModule],
    controllers: [StudentController],
    providers: [StudentService],
})
export class StudentModule { }