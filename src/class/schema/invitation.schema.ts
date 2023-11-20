import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "src/utils/database/abstract.schema";
import { Document } from "mongoose";

export type InvitationDocument = Invitation & Document;

@Schema({
    toJSON: {
        getters: true,
        virtuals: true,
    },
    timestamps: true,
})
export class Invitation extends AbstractDocument {
    @Prop({ required: true, unique: true })
    class_id: string;

    @Prop({ required: true })
    class_token: string;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
