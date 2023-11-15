import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, SchemaTypes, Document } from "mongoose";

export enum Role {
    ADMIN = 'admin',
    USER = 'user',
}

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

export type UserDocument = User & Document;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class User {
    @Prop({ default: generateUUID() })
    _id: string;

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

    @Prop({ default: new Date() })
    create_At: Date;

    @Prop({ default: new Date() })
    update_At: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);