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

    @Prop({ default: null })
    list_student_url: string;

    @Prop({
        type: [
            {
                gradeCompo_name: { type: String, required: true },
                gradeCompo_scale: { type: Number, required: true },
                is_finalized: { type: Boolean, default: false },
            },
        ],
        validate: {
            validator: function (gradeCompositions) {
                const names = gradeCompositions.map(comp => comp.gradeCompo_name);
                return (new Set(names)).size === names.length;
            },
            message: "gradeCompo_name must be unique within the grade_compositions array.",
        },
        default: [],
    })
    grade_compositions: {
        gradeCompo_name: string;
        gradeCompo_scale: number;
        is_finalized: boolean;
    }[];
}

export const ClassSchema = SchemaFactory.createForClass(Class);