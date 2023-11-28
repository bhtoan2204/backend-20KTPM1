import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Notification, NotificationDocument } from "src/utils/schema/notification.schema";
import { NotificationDto } from "./dto/notification.dto";

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationRepository: Model<NotificationDocument>
    ) { }

    async create(notification: NotificationDto): Promise<Notification> {
        return await this.notificationRepository.create(notification);
    }
}