import { Module } from "@nestjs/common";
import { NotificationGateway } from "./notification.gateway";
import { MongooseModule } from "@nestjs/mongoose";
import { NotificationSchema } from "src/utils/schema/notification.schema";
import { NotificationService } from "./notification.service";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Notification', schema: NotificationSchema }]),
        AuthModule,
    ],
    providers: [NotificationGateway, NotificationService]
})
export class NotificationModule { }