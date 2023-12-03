import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { type } from "os";
import { AbstractDocument } from "src/utils/database/abstract.schema";
import { Status } from "../enum/status.enum";

export type GradeReviewDocument = GradeReview & Document;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class GradeReview extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'Class' })
    class_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    student_id: Types.ObjectId;

    @Prop({ required: true })
    gradeCompo_name: string;

    @Prop({ required: true })
    current_grade: number;

    @Prop({ required: true })
    expected_grade: number;

    @Prop()
    student_explain: string;

    @Prop()
    comments: Array<{
        commenter: string,
        text: string
    }>;

    @Prop({ type: Object })
    finalDecision: {
        status: { type: Status, default: Status.PENDING },
        updatedGrade: { type: Number, default: 0 }
    };
}

export const GradeReviewSchema = SchemaFactory.createForClass(GradeReview);