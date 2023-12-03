import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Request } from "express";
import { Invitation, InvitationDocument } from "src/utils/schema/invitation.schema";
import { Class, ClassDocument } from "src/utils/schema/class.schema";
import { ClassUser, ClassUserDocument } from "src/utils/schema/classUser.schema";
import { User, UserDocument } from "src/utils/schema/user.schema";

@Injectable()
export class InvitationService {
    constructor(
        @InjectModel(Invitation.name) private readonly invitationRepository: Model<InvitationDocument>,
        @InjectModel(Class.name) private readonly classRepository: Model<ClassDocument>,
        @InjectModel(ClassUser.name) private readonly classUserRepository: Model<ClassUserDocument>,
        @InjectModel(User.name) private readonly userRepository: Model<UserDocument>,
    ) { }

    async checkIsHost(user: User, classId: Types.ObjectId): Promise<any> {
        const clazz = await this.classRepository.findOne({ _id: classId, host: user._id }).exec();
        if (!clazz) {
            return new HttpException('You are not the host of this class', HttpStatus.FORBIDDEN);
        }
    }

    async checkInClass(user: User, classId: Types.ObjectId): Promise<any> {
        const classUser = await this.classUserRepository.findOne(
            {
                class_id: classId,
                'teachers.user_id': user._id
            }
        ).exec();
        if (classUser == null) {
            return new HttpException('You are not in this class', HttpStatus.FORBIDDEN);
        }
    }

    async getInvitations(user: User, classid: string, req: Request): Promise<any> {
        const classId = new Types.ObjectId(classid);

        this.checkIsHost(user, classId);

        const existingInvitation = await this.invitationRepository.findOne({ class_id: classId });

        if (existingInvitation) {
            existingInvitation.class_token = (Math.random() + 1).toString(36).substring(8);

            return await existingInvitation.save();
        }

        const newInvitation = new this.invitationRepository({
            class_id: classId,
            class_token: (Math.random() + 1).toString(36).substring(8),
        });

        await newInvitation.save();

        return {
            newInvitation
        };
    }

    async joinClass(user: User, classToken: string, classid: string): Promise<any> {
        const classId = new Types.ObjectId(classid);
        this.checkInClass(user, classId);

        const invitation = await this.invitationRepository.findOne({ class_id: classId, class_token: classToken }).exec();

        if (!invitation) return new NotFoundException("Invitation not found");

        const classUser = await this.classUserRepository.findOne(
            { class_id: classId }
        )
        if (classUser.teachers.findIndex(teacher => teacher.user_id == user._id) == -1) {
            classUser.teachers.push({ user_id: user._id });
            await classUser.save();
            this.userRepository.findOneAndUpdate({ _id: user._id }, { $push: { classes: { class_id: classId } } }).exec();
            return {
                message: 'Join class successfully'
            };
        }
        else {
            return new HttpException('You are already in this class', HttpStatus.FORBIDDEN);
        }
    }
}