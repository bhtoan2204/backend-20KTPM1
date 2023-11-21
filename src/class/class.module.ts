import { Module } from '@nestjs/common';
import { InvitationController, ClassController } from './class.controller';
import { ClassService } from './class.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassSchema } from './schema/class.schema';
import { InvitationSchema } from './schema/invitation.schema';
import { ClassUserSchema } from './schema/classUser.schema';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        UserModule,
        MongooseModule.forFeature([{ name: 'Class', schema: ClassSchema }]),
        MongooseModule.forFeature([{ name: 'Invitation', schema: InvitationSchema }]),
        MongooseModule.forFeature([{ name: 'ClassUser', schema: ClassUserSchema }]),
    ],
    controllers: [ClassController, InvitationController],
    providers: [ClassService],
    exports: [ClassService],
})
export class ClassModule { }
