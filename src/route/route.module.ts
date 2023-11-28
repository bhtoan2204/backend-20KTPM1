import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { AccountsModule } from "src/admin/accounts/accounts.module";
import { AdminModule } from "src/admin/admin.module";
import { ClassStudentsModule } from "src/student/class/class.module";
import { GradeViewerModule } from "src/student/grade/grade.module";
import { StudentModule } from "src/student/student.module";
import { ClassModule } from "src/teacher/class/class.module";
import { GradeModule } from "src/teacher/grade/grade.module";
import { TeacherModule } from "src/teacher/teacher.module";

@Module({
    imports: [
        RouterModule.register([
            {
                path: '',
                module: AdminModule,
                children: [
                    {
                        path: 'admin',
                        module: AccountsModule,
                    }
                ]
            },
            {
                path: '',
                module: TeacherModule,
                children: [
                    {
                        path: 'teacher',
                        module: ClassModule,
                    },
                    {
                        path: 'teacher',
                        module: GradeModule,
                    }
                ]
            },
            {
                path: '',
                module: StudentModule,
                children: [
                    {
                        path: 'student',
                        module: ClassStudentsModule,
                    },
                    {
                        path: 'student',
                        module: GradeViewerModule,
                    }
                ]
            }
        ])
    ],
    exports: [RouteModule]
})
export class RouteModule { }