import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Class } from "./schema/class.schema";
import { Model } from "mongoose";
import { User } from "src/user/schema/user.schema";
import { CreateClassDto } from "./dto/createClass.dto";
import { ClassUser } from "./schema/classUser.schema";
import { Invitation } from "./schema/invitation.schema";
import { generateRandomPassword } from "src/utils/generator/password.generator";
import { Request } from "express";
import { UserService } from "src/user/user.service";

@Injectable()
export class ClassService {
    constructor(
        @InjectModel(Class.name) private readonly classRepository: Model<Class>,
        @InjectModel(Invitation.name) private readonly invitationRepository: Model<Invitation>,
        @InjectModel(ClassUser.name) private readonly classUserRepository: Model<ClassUser>,
        @Inject(UserService) private readonly userService: UserService,
    ) { }

    async checkInClass(user: User, classId: string): Promise<boolean> {
        const classUser = await this.classUserRepository.findOne({ user_id: user._id, class_id: classId }).exec();
        if (classUser == null) return false;
        return true;
    }

    async checkIsHost(user: User, classId: string): Promise<boolean> {
        const clazz = await this.classRepository.findOne({ _id: classId, host: user._id }).exec();
        if (!clazz) return false;
        return true;
    }

    async create(host: User, dto: CreateClassDto): Promise<any> {
        const newClass = new this.classRepository({
            className: dto.className,
            description: dto.description,
            host: host._id
        });
        await newClass.save();

        const newClassUser = new this.classUserRepository({
            class_id: newClass._id,
            user_id: host._id,
            isStudent: false,
        });
        await newClassUser.save();

        return { newClass, newClassUser };
    }

    async getAll(host: User): Promise<Class[]> {
        return await this.classRepository.find({ host: host._id })
            .select('_id className description')
            .exec();
    }

    async getClassDetail(host: User, classId: string): Promise<any> {
        const isInClass = this.checkInClass(host, classId);
        if (!isInClass) return { message: "You are not in this class" };

        else {
            const clazz = await this.classRepository.findOne({ _id: classId, host: host._id })
                .select('_id className description')
                .exec();
            if (!clazz) return { message: "You already in this class" };
            return clazz;
        }
    }

    async getTeachers(host: User, classId: string): Promise<any> {
        const isInClass = this.checkInClass(host, classId);
        if (!isInClass) return { message: "You already in this class" };
        try {
            const classUsers = await this.classUserRepository.find({ class_id: classId, isStudent: false });
            const userIds = classUsers.map(classUser => classUser.user_id);
            const teachers = await this.userService.getUsersByIds(userIds);

            return teachers;
        }
        catch (error) {
            return { message: `Error: ${error.message}` };
        }
    }

    async getStudents(host: User, classId: string): Promise<any> {
        const isInClass = this.checkInClass(host, classId);
        if (!isInClass) return { message: "You already in this class" };
        try {
            const classUsers = await this.classUserRepository.find({ class_id: classId, isStudent: true });
            const userIds = classUsers.map(classUser => classUser.user_id);
            const students = await this.userService.getUsersByIds(userIds);

            return students;
        }
        catch (error) {
            return { message: `Error: ${error.message}` };
        }
    }

    async getInvitations(user: User, classId: string, req: Request): Promise<any> {
        const isHost = this.checkIsHost(user, classId);
        if (!isHost) return { message: "You are not host of this class" };

        const existingInvitation = await this.invitationRepository.findOne({ class_id: classId });

        if (existingInvitation) {
            return {
                existingInvitation
            };
        }

        const newInvitation = new this.invitationRepository({
            class_id: classId,
            class_token: generateRandomPassword(8), // 8 characters
        });

        await newInvitation.save();

        return {
            newInvitation
        };
    }

    async joinClassAsStudent(user: User, classToken: string, classId: string): Promise<any> {
        const isInClass = await this.checkInClass(user, classId);
        if (isInClass) return { message: "You already in this class" };

        const invitation = await this.invitationRepository.findOne({ class_id: classId, class_token: classToken }).exec();

        if (!invitation) return { message: "Invitation not found" };

        const classUser = new this.classUserRepository({
            class_id: classId,
            user_id: user._id,
            isStudent: true,
        });
        await classUser.save();
        return classUser;
    }
}