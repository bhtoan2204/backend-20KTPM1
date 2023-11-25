import { Module } from "@nestjs/common";
import { GradeViewerController } from "./controller/gradeViewer.controller";
import { GradeViewerService } from "./service/gradeViewer.service";

@Module({
    imports: [],
    controllers: [GradeViewerController],
    providers: [GradeViewerService],
})
export class GradeViewerModule {

}