import { Module } from "@nestjs/common";
import { StudentController } from "./student.controller";
import { ClassStudentsModule } from "./class/class.module";
import { StudentService } from "./student.service";
import { GradeViewerModule } from "./grade/grade.module";

@Module({
    imports: [ClassStudentsModule, GradeViewerModule],
    controllers: [StudentController],
    providers: [StudentService],
})
export class StudentModule { }