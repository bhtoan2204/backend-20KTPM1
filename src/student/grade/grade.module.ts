import { Module } from "@nestjs/common";
import { GradeViewerController } from "./controller/gradeViewer.controller";
import { GradeViewerService } from "./service/gradeViewer.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassSchema } from "src/utils/schema/class.schema";
import { ClassUserSchema } from "src/utils/schema/classUser.schema";
import { UserGradeSchema } from "src/utils/schema/userGrade.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Class', schema: ClassSchema }]),
        MongooseModule.forFeature([{ name: 'ClassUser', schema: ClassUserSchema }]),
        MongooseModule.forFeature([{ name: 'UserGrade', schema: UserGradeSchema }]),
    ],
    controllers: [GradeViewerController],
    providers: [GradeViewerService],
})
export class GradeViewerModule {

}