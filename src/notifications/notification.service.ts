import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Notification, NotificationDocument } from "src/utils/schema/notification.schema";
import { NotificationDto } from "./dto/notification.dto";
import { User, UserDocument } from "src/utils/schema/user.schema";

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationRepository: Model<NotificationDocument>,
        @InjectModel(User.name) private userRepository: Model<UserDocument>,
    ) { }


    async createNotification(currentUser: any, notification: NotificationDto) {
        const receiver = this.userRepository.find({ _id: new Types.ObjectId(notification.receiver_id) });
        if (!receiver) {
            throw new Error("Receiver not found");
        }
        const notificationDetail = {
            sender_id: currentUser._id,
            title: notification.title,
            content: notification.content,
            is_read: false
        }
        const newNotification = await this.notificationRepository.findOne({
            receiver_id: new Types.ObjectId(notification.receiver_id)
        });
        if (!newNotification) {
            const newNotification = await this.notificationRepository.create({
                receiver_id: new Types.ObjectId(notification.receiver_id),
                notifications: [notificationDetail]
            });
            return newNotification.notifications;
        }
        else {
            await this.notificationRepository.updateOne({
                receiver_id: new Types.ObjectId(notification.receiver_id)
            }, {
                $push: {
                    notifications: notificationDetail
                }
            });
            return newNotification.notifications;
        }
    }
}