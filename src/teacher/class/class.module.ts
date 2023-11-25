import { Module } from '@nestjs/common';
import { ClassController } from './controller/class.controller';
import { ClassService } from './service/class.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassSchema } from './schema/class.schema';
import { InvitationSchema } from './schema/invitation.schema';
import { ClassUserSchema } from './schema/classUser.schema';
import { InvitationController } from './controller/invitation.controller';
import { InvitationService } from './service/invitation.service';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        UserModule,
        MongooseModule.forFeature([{ name: 'Class', schema: ClassSchema }]),
        MongooseModule.forFeature([{ name: 'Invitation', schema: InvitationSchema }]),
        MongooseModule.forFeature([{ name: 'ClassUser', schema: ClassUserSchema }]),
    ],
    controllers: [ClassController, InvitationController],
    providers: [ClassService, InvitationService],
})
export class ClassModule { }
