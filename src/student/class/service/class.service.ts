import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UserService } from "src/user/user.service";
import { Class, ClassDocument } from "src/utils/schema/class.schema";
import { ClassUser, ClassUserDocument } from "src/utils/schema/classUser.schema";
import { Invitation, InvitationDocument } from "src/utils/schema/invitation.schema";
import { User, UserDocument } from "src/utils/schema/user.schema";

@Injectable()
export class ClassService {
    constructor(
        @InjectModel(Class.name) private readonly classRepository: Model<ClassDocument>,
        @InjectModel(ClassUser.name) private readonly classUserRepository: Model<ClassUserDocument>,
        @InjectModel(Invitation.name) private readonly invitationRepository: Model<InvitationDocument>,
        @InjectModel(User.name) private readonly userRepository: Model<UserDocument>,
    ) { }

    async checkInClass(user: User, classId: any): Promise<any> {
        const classUser = await this.classUserRepository.findOne({
            class_id: new Types.ObjectId(classId),
            'students.user_id': user._id
        }).exec();

        if (classUser == null) {
            return new HttpException('You are not in this class', HttpStatus.FORBIDDEN);
        }
    }

    async joinClass(user: User, classToken: string, classid: string): Promise<any> {
        const classId = new Types.ObjectId(classid);

        this.checkInClass(user, classId);

        const invitation = await this.invitationRepository.findOne({ class_id: classId, class_token: classToken }).exec();

        if (!invitation) return new NotFoundException("Invitation not found");

        const classUser = await this.classUserRepository.findByIdAndUpdate(
            { class_id: classId },
            { $push: { students: { user_id: user._id } } },
            { new: true }
        )

        const clazz = await this.classRepository.findOne({ _id: classId }).exec();

        await this.userRepository.findOneAndUpdate(
            { _id: user._id },
            {
                $push: {
                    classes: {
                        class_id: classId,
                        class_name: clazz.className,
                        class_description: clazz.description,
                    }
                }
            },
            { new: true }
        )

        return classUser;
    }

    async joinClassByCode(user: User, classId: string): Promise<any> {
        this.checkInClass(user, classId);

        const classUser = await this.classUserRepository.findByIdAndUpdate(
            { class_id: classId },
            { $push: { students: { user_id: user._id } } },
            { new: true }
        )

        const clazz = await this.classRepository.findOne({ _id: classId }).exec();

        await this.userRepository.findOneAndUpdate(
            { _id: user._id },
            {
                $push: {
                    classes: {
                        class_id: classId,
                        class_name: clazz.className,
                        class_description: clazz.description,
                    }
                }
            },
            { new: true }
        )

        return classUser;
    }

    getJoinedClasses(user: User) {
        return user.classes;
    }

    async viewGradeStructure(user: User, classId: string) {
        this.checkInClass(user, classId);
        return await this.classRepository.findOne({ _id: classId }).select("grade_compositions").exec();
    }

    async viewClassMembers(user: User, classId: string) {
        this.checkInClass(user, classId);
        return await this.classUserRepository.findOne({ class_id: new Types.ObjectId(classId) }).select("students").exec();
    }
}