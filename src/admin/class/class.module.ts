import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "src/utils/schema/user.schema";
import { ClassSchema } from "src/utils/schema/class.schema";
import { ClassAdminService } from "./class.service";
import { ClassAdminController } from "./class.controller";
import { ClassUserSchema } from "src/utils/schema/classUser.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        MongooseModule.forFeature([{ name: 'Class', schema: ClassSchema }]),
        MongooseModule.forFeature([{ name: 'ClassUser', schema: ClassUserSchema }])
    ],
    controllers: [ClassAdminController],
    providers: [ClassAdminService],
})
export class ClassAdminModule { }