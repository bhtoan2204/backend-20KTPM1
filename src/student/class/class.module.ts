import { Module } from "@nestjs/common";
import { ClassController } from "./controller/class.controller";
import { ClassService } from "./service/class.service";
import { UserModule } from "src/user/user.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassSchema } from "src/utils/schema/class.schema";
import { InvitationSchema } from "src/utils/schema/invitation.schema";
import { ClassUserSchema } from "src/utils/schema/classUser.schema";

@Module({
    imports: [
        UserModule,
        MongooseModule.forFeature([{ name: 'Class', schema: ClassSchema }]),
        MongooseModule.forFeature([{ name: 'Invitation', schema: InvitationSchema }]),
        MongooseModule.forFeature([{ name: 'ClassUser', schema: ClassUserSchema }]),
    ],
    controllers: [ClassController],
    providers: [ClassService],
})
export class ClassModule { }