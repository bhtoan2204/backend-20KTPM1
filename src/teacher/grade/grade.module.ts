import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GradeCompositionSchema } from './schema/gradeComposition.schema';
import { GradeCompositionController } from './controllers/gradeComposition.controller';
import { ClassModule } from '../class/class.module';
import { GradeManagementController } from './controllers/gradeManagement.controller';
import { GradeCompositionService } from './service/gradeComposition.service';
import { GradeManagementService } from './service/gradeManagement.service';
import { UserModule } from 'src/user/user.module';
import { ClassSchema } from './schema/class.schema';
import { ClassUserSchema } from './schema/classUser.schema';
import { UserSchema } from './schema/user.schema';
import { GradeReviewSchema } from './schema/gradeReview.schema';
import { GradeReviewController } from './controllers/gradeReview.controller';
import { GradeReviewService } from './service/gradeReview.service';

@Module({
    imports: [
        ClassModule,
        UserModule,
        MongooseModule.forFeature([{ name: 'GradeComposition', schema: GradeCompositionSchema }]),
        MongooseModule.forFeature([{ name: 'Class', schema: ClassSchema }]),
        MongooseModule.forFeature([{ name: 'ClassUser', schema: ClassUserSchema }]),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        MongooseModule.forFeature([{ name: 'GradeReview', schema: GradeReviewSchema }]),
    ],
    controllers: [GradeCompositionController, GradeManagementController, GradeReviewController],
    providers: [GradeCompositionService, GradeManagementService, GradeReviewService],
})
export class GradeModule { }
