import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { AbstractDocument } from "src/utils/database/abstract.schema";

export type ClassUserDocument = ClassUser & Document;


class Student {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    user_id: Types.ObjectId;

    @Prop({ default: null, nullable: true })
    student_id: string;
}

class Teacher {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    user_id: Types.ObjectId;
}

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class ClassUser extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'Class', unique: true })
    class_id: Types.ObjectId;

    @Prop({ type: [Student], default: [] })
    students: Student[];

    @Prop({ type: [Teacher], default: [] })
    teachers: Teacher[];
}

export const ClassUserSchema = SchemaFactory.createForClass(ClassUser);
