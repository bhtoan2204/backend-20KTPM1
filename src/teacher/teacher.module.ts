import { Module } from "@nestjs/common";
import { ClassModule } from "./class/class.module";
import { GradeModule } from "./grade/grade.module";

@Module({
    imports: [ClassModule, GradeModule],
    exports: [TeacherModule]
})
export class TeacherModule { }