import { Module } from "@nestjs/common";
import { ClassController } from "./controller/class.controller";
import { ClassService } from "./service/class.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ClassSchema } from "src/utils/schema/class.schema";
import { InvitationSchema } from "src/utils/schema/invitation.schema";
import { ClassUserSchema } from "src/utils/schema/classUser.schema";
import { UserSchema } from "src/utils/schema/user.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Class', schema: ClassSchema }]),
        MongooseModule.forFeature([{ name: 'Invitation', schema: InvitationSchema }]),
        MongooseModule.forFeature([{ name: 'ClassUser', schema: ClassUserSchema }]),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    ],
    controllers: [ClassController],
    providers: [ClassService],
})
export class ClassStudentsModule { }