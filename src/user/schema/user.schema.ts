import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, SchemaTypes, Types } from "mongoose";
import { AbstractDocument } from "src/utils/database/abstract.schema";

export enum Role {
    ADMIN = 'admin',
    USER = 'user',
}

export type UserDocument = User & Document;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class User extends AbstractDocument {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop()
    password: string;

    @Prop()
    fullname: string;

    @Prop({ type: String, enum: Role })
    role: string

    @Prop({ default: null })
    avatar: string;

    @Prop()
    birthday: Date;

    @Prop({ default: null })
    refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);