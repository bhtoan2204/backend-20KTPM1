import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ResetOtpDocument = ResetOtp & Document;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class ResetOtp {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    otp: number;
}

export const ResetOtpSchema = SchemaFactory.createForClass(ResetOtp);