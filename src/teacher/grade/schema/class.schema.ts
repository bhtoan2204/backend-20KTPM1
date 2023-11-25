import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
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
    host: Types.ObjectId;
}

export const ClassSchema = SchemaFactory.createForClass(Class);