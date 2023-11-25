import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { AbstractDocument } from "src/utils/database/abstract.schema";

enum Role {
    ADMIN = 'admin',
    STUDENT = 'student',
    TEACHER = 'teacher',
    NULL = 'null',
}

enum LoginType {
    GOOGLE = 'google',
    FACEBOOK = 'facebook',
    LOCAL = 'local',
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

    @Prop({ default: 'local', type: String, enum: LoginType })
    login_type: string
}

export const UserSchema = SchemaFactory.createForClass(User);