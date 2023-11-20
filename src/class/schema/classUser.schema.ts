import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "src/user/schema/user.schema";
import { AbstractDocument } from "src/utils/database/abstract.schema";
import { Class } from "./class.schema";

export type ClassUserDocument = ClassUser & Document;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class ClassUser extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'Class' })
    class_id: Class;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    user_id: User;

    @Prop({ required: [true, "Are you a student?"] })
    isStudent: boolean;
}

export const ClassUserSchema = SchemaFactory.createForClass(ClassUser);
