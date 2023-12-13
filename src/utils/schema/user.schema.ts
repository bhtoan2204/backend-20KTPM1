import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { AbstractDocument } from "../../utils/database/abstract.schema";
import { Role } from "src/utils/enum/role.enum";
import { LoginType } from "src/utils/enum/loginType.enum";

export type UserDocument = User & Document;

class Class {
    @Prop({ type: Types.ObjectId, ref: 'Class' })
    class_id: Types.ObjectId;

    @Prop({ default: null })
    class_name: string;

    @Prop({ default: null })
    class_description: string;

}

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class User extends AbstractDocument {
    @Prop({ required: true })
    email: string;

    @Prop()
    password: string;

    @Prop()
    fullname: string;

    @Prop({ type: String, enum: Role })
    role: string

    @Prop({ default: 'https://storageclassroom.blob.core.windows.net/upload-file/c3f2c592f9 (1).jpg' })
    avatar: string;

    @Prop()
    birthday: Date;

    @Prop({ default: null })
    refreshToken: string;

    @Prop({ default: 'local', type: String, enum: LoginType })
    login_type: string

    @Prop({ default: false })
    is_ban: boolean;

    @Prop({ type: [Class], default: [] })
    classes: Class[];
}

export const UserSchema = SchemaFactory.createForClass(User);