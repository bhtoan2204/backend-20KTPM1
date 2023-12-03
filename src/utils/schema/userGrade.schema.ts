import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { AbstractDocument } from "../database/abstract.schema";

export type UserGradeDocument = UserGrade & Document;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class UserGrade extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    user_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Class' })
    class_id: Types.ObjectId;

    @Prop({
        type: [
            {
                grades: [
                    {
                        gradeCompo_name: { type: String, required: true },
                        gradeCompo_scale: { type: Number, required: true },
                        current_grade: { type: Number, required: true },
                    },
                ],
            },
        ],
        default: [],
    })
    grades: {
        gradeCompo_name: string;
        gradeCompo_scale: number;
        current_grade: number;
    }[];

    @Prop({ type: Number, default: null })
    overall_grade: number;
}

export const UserGradeSchema = SchemaFactory.createForClass(UserGrade);
