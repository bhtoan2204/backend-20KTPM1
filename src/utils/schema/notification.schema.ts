import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { AbstractDocument } from "../../utils/database/abstract.schema";

export type NotificationDocument = Notification & Document;

class NotificationDetail {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    sender_id: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    content: string;

    @Prop({ default: false })
    is_read: boolean;
}

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class Notification extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'User', unique: true })
    receiver_id: Types.ObjectId;

    @Prop({ type: [NotificationDetail], default: [] })
    notifications: NotificationDetail[];
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);