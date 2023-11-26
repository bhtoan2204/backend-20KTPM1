import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { AbstractDocument } from "src/utils/database/abstract.schema";

export type ClassDocument = Class & Document;

class GradeComposition extends AbstractDocument {
    @Prop({ required: [true, "Grade Composition Name Required"], unique: true })
    gradeCompo_name: string;

    @Prop({ required: [true, "Grade Composition Scale Required"] })
    gradeCompo_scale: number;

    @Prop({ default: false })
    is_finalized: boolean;
}

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class Class {
    @Prop({ required: [true, "Class Name Required"] })
    className: string;

    @Prop({ default: '' })
    description: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    host: Types.ObjectId;

    @Prop({ type: [GradeComposition], default: [] })
    grade_compositions: GradeComposition[];
}

export const ClassSchema = SchemaFactory.createForClass(Class);