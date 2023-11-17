import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type OtpDocument = Otp & Document;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class Otp {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    otp: number;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);