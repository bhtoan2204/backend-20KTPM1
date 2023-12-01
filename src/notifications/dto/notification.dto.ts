import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { AbstractDocument } from "../../utils/database/abstract.schema";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class NotificationDto {
    @IsNotEmpty()
    @IsString()
    receiver_id: string;

    @IsNotEmpty()
    @IsString()
    @Prop({ required: true })
    title: string;

    @IsString()
    @Prop({ required: true })
    content: string;

    @IsNotEmpty()
    @IsBoolean()
    is_read: boolean;
}
