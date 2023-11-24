import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GradeCompositionSchema } from './schema/gradeComposition.schema';
import { GradeService } from './grade.service';
import { GradeCompositionController } from './controllers/gradeComposition.controller';
import { ClassModule } from '../class/class.module';
import { GradeManagementController } from './controllers/gradeManagement.controller';

@Module({
    imports: [
        ClassModule,
        MongooseModule.forFeature([{ name: 'GradeComposition', schema: GradeCompositionSchema }]),
    ],
    controllers: [GradeCompositionController, GradeManagementController],
    providers: [GradeService],
    exports: [GradeService],
})
export class GradeModule { }
