import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { AbstractDocument } from "src/utils/database/abstract.schema";

export type InvitationDocument = Invitation & Document;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class Invitation extends AbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'Class' })
    class_id: Types.ObjectId;

    @Prop({ required: true })
    class_token: string;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
