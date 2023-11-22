import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GradeCompositionSchema } from './schema/gradeComposition.schema';
import { GradeService } from './grade.service';
import { GradeCompositionController } from './grade.controller';
import { ClassModule } from '../class/class.module';

@Module({
    imports: [
        ClassModule,
        MongooseModule.forFeature([{ name: 'GradeComposition', schema: GradeCompositionSchema }]),
    ],
    controllers: [GradeCompositionController],
    providers: [GradeService],
    exports: [GradeService],
})
export class GradeModule { }
