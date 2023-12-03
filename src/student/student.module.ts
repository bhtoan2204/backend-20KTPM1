import { Module } from "@nestjs/common";
import { ClassStudentsModule } from "./class/class.module";
import { GradeViewerModule } from "./grade/grade.module";

@Module({
    imports: [ClassStudentsModule, GradeViewerModule],
    exports: [StudentModule]
})
export class StudentModule { }