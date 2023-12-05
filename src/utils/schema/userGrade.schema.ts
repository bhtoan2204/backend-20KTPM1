import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { AbstractDocument } from "../database/abstract.schema";

export type UserGradeDocument = UserGrade & Document;

class Grades {
    @Prop({ type: String, required: true })
    gradeCompo_name: string;

    @Prop({ type: Number, required: true })
    gradeCompo_scale: number;

    @Prop({ type: Number, required: true })
    current_grade: number;
}

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

    @Prop({ type: [Grades], default: [] })
    grades: Grades[];

    @Prop({ type: Number, default: null })
    overall_grade: number;
}

export const UserGradeSchema = SchemaFactory.createForClass(UserGrade);
