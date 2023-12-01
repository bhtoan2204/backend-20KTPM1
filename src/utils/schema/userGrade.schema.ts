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
    @Prop({ type: Types.ObjectId, ref: 'User', unique: true })
    user_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Class', unique: true })
    class_id: Types.ObjectId;

    @Prop({
        type: [
            {
                grades: [
                    {
                        gradeCompo_name: { type: String, required: true },
                        current_grade: { type: Number, required: true },
                        expected_grade: { type: Number, required: true },
                    },
                ],
            },
        ],
        default: [],
    })
    class_grades: {
        grades: {
            gradeCompo_name: string;
            gradeCompo_scale: number;
            current_grade: number;
        }[];
        overall_grade: number;
    }[];
}

export const UserGradeSchema = SchemaFactory.createForClass(UserGrade);