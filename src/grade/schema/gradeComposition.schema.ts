import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { AbstractDocument } from "src/utils/database/abstract.schema";

export type GradeCompositionDocument = GradeComposition & Document;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class GradeComposition extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'Class' })
    class_id: Types.ObjectId;

    @Prop({ required: [true, "Grade Composition Name Required"] })
    gradeCompo_name: string;

    @Prop({ required: [true, "Grade Composition Scale Required"] })
    gradeCompo_scale: number;
}

export const GradeCompositionSchema = SchemaFactory.createForClass(GradeComposition);