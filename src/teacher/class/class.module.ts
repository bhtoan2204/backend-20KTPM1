import { Module } from '@nestjs/common';
import { ClassController } from './controller/class.controller';
import { ClassService } from './service/class.service';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationController } from './controller/invitation.controller';
import { InvitationService } from './service/invitation.service';
import { UserModule } from 'src/user/user.module';
import { ClassSchema } from 'src/utils/schema/class.schema';
import { InvitationSchema } from 'src/utils/schema/invitation.schema';
import { ClassUserSchema } from 'src/utils/schema/classUser.schema';
import { UserSchema } from 'src/utils/schema/user.schema';
import { UserGradeSchema } from 'src/utils/schema/userGrade.schema';

@Module({
    imports: [
        UserModule,
        MongooseModule.forFeature([{ name: 'Class', schema: ClassSchema }]),
        MongooseModule.forFeature([{ name: 'Invitation', schema: InvitationSchema }]),
        MongooseModule.forFeature([{ name: 'ClassUser', schema: ClassUserSchema }]),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        MongooseModule.forFeature([{ name: 'UserGrade', schema: UserGradeSchema }]),
    ],
    controllers: [ClassController, InvitationController],
    providers: [ClassService, InvitationService],
})
export class ClassModule { }
