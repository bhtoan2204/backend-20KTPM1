import { Module } from "@nestjs/common";
import { GradeViewerController } from "./controller/gradeViewer.controller";
import { GradeViewerService } from "./service/gradeViewer.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassSchema } from "src/utils/schema/class.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Class', schema: ClassSchema }]),
    ],
    controllers: [GradeViewerController],
    providers: [GradeViewerService],
})
export class GradeViewerModule {

}