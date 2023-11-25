import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Invitation } from "../schema/invitation.schema";
import { Model, Types } from "mongoose";
import { User } from "src/user/schema/user.schema";
import { Class } from "../schema/class.schema";
import { Request } from "express";
import { ClassUser } from "../schema/classUser.schema";

@Injectable()
export class InvitationService {
    constructor(
        @InjectModel(Invitation.name) private readonly invitationRepository: Model<Invitation>,
        @InjectModel(Class.name) private readonly classRepository: Model<Class>,
        @InjectModel(ClassUser.name) private readonly classUserRepository: Model<ClassUser>,
    ) { }

    async checkIsHost(user: User, classId: string): Promise<any> {
        const clazz = await this.classRepository.findOne({ _id: classId, host: user._id }).exec();
        if (!clazz) {
            return new HttpException('You are not the host of this class', HttpStatus.FORBIDDEN);
        }
    }

    async checkInClass(user: User, classId: string): Promise<any> {
        const classUser = await this.classUserRepository.findOne({ user_id: user._id, class_id: classId }).exec();
        if (classUser == null) {
            return new HttpException('You are not in this class', HttpStatus.FORBIDDEN);
        }
    }

    async getInvitations(user: User, classId: string, req: Request): Promise<any> {
        this.checkIsHost(user, classId);

        const existingInvitation = await this.invitationRepository.findOne({ class_id: classId });

        if (existingInvitation) {
            return {
                existingInvitation
            };
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

    async joinClassAsTeacher(user: User, classToken: string, classId: string): Promise<any> {
        this.checkInClass(user, classId);

        const invitation = await this.invitationRepository.findOne({ class_id: classId, class_token: classToken }).exec();

        if (!invitation) return new NotFoundException("Invitation not found");

        const classUser = new this.classUserRepository({
            class_id: new Types.ObjectId(classId),
            user_id: new Types.ObjectId(user._id),
            isStudent: false,
        });


        await classUser.save();
        return classUser;
    }
}