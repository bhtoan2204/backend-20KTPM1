import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, SchemaTypes, Types } from "mongoose";
import { User } from "src/user/schema/user.schema";
import { AbstractDocument } from "src/utils/database/abstract.schema";

export type ClassDocument = Class & Document;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class Class extends AbstractDocument {
    @Prop({ required: [true, "Class Name Required"] })
    className: string;

    @Prop({ default: '' })
    description: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    host: User;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    teachers: User[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    students: User[];

    @Prop({ default: '' })
    invitationLink: string;

}

export const ClassSchema = SchemaFactory.createForClass(Class);