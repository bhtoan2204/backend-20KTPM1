import { ConflictException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Class } from "./schema/class.schema";
import { Model } from "mongoose";
import { User } from "../user/schema/user.schema";
import { CreateClassDto } from "./dto/createClass.dto";
import { ClassUser } from "./schema/classUser.schema";
import { Invitation } from "./schema/invitation.schema";
import { generateRandomPassword } from "../utils/generator/password.generator";
import { Request } from "express";
import { UserService } from "../user/user.service";
import { Types } from 'mongoose';

@Injectable()
export class ClassService {
    constructor(
        @InjectModel(Class.name) private readonly classRepository: Model<Class>,
        @InjectModel(Invitation.name) private readonly invitationRepository: Model<Invitation>,
        @InjectModel(ClassUser.name) private readonly classUserRepository: Model<ClassUser>,
        @Inject(UserService) private readonly userService: UserService,
    ) { }

    async checkInClass(user: User, classId: string): Promise<any> {
        const classUser = await this.classUserRepository.findOne({ user_id: user._id, class_id: classId }).exec();
        if (classUser == null) {
            return new HttpException('You are not in this class', HttpStatus.FORBIDDEN);
        }
    }

    async checkIsHost(user: User, classId: string): Promise<any> {
        const clazz = await this.classRepository.findOne({ _id: classId, host: user._id }).exec();
        if (!clazz) {
            return new HttpException('You are not the host of this class', HttpStatus.FORBIDDEN);
        }
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

    async deleteClass(host: User, classId: string): Promise<any> {
        this.checkIsHost(host, classId);

        const clazz = await this.classRepository.findOne({ _id: classId, host: host._id }).exec();
        if (!clazz) return new NotFoundException("Class not found");

        await this.classRepository.deleteOne({ _id: classId, host: host._id }).exec();
        await this.classUserRepository.deleteMany({ class_id: classId }).exec();

        return new HttpException("Delete class successfully", HttpStatus.OK);
    }

    async getAll(host: User): Promise<any> {
        const classes = await this.classRepository.find({ host: host._id })
            .select('_id className description')
            .exec();

        if (!classes || classes.length === 0) {
            return new NotFoundException('No classes found for the given host');
        }

        return classes;
    }

    async getClassDetail(host: User, classId: string): Promise<any> {
        this.checkInClass(host, classId);

        const clazz = await this.classRepository.findOne({ _id: classId, host: host._id })
            .select('_id className description')
            .exec();

        if (!clazz) return new ConflictException("You already in this class");

        return clazz;
    }

    async getTeachers(host: User, classId: string): Promise<any> {
        this.checkInClass(host, classId);
        try {
            const classUsers = await this.classUserRepository.find({ class_id: new Types.ObjectId(classId), isStudent: false });
            const userIds = classUsers.map(classUser => classUser.user_id);
            const teachers = await this.userService.getUsersByIds(userIds);
            return teachers;
        }
        catch (error) {
            return { message: `Error: ${error.message}` };
        }
    }

    async getStudents(host: User, classId: string): Promise<any> {
        this.checkInClass(host, classId);
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
        this.checkIsHost(user, classId);

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
        this.checkInClass(user, classId);

        const invitation = await this.invitationRepository.findOne({ class_id: classId, class_token: classToken }).exec();

        if (!invitation) return new NotFoundException("Invitation not found");

        const classUser = new this.classUserRepository({
            class_id: new Types.ObjectId(classId),
            user_id: new Types.ObjectId(user._id),
            isStudent: true,
        });


        await classUser.save();
        return classUser;
    }

    async getJoinedClasses(user: User): Promise<any> {
        const classUsers = await this.classUserRepository.find({ user_id: user._id, isStudent: true })
            .select('class_id')
            .exec();
        const classIds = classUsers.map(classUser => classUser.class_id);
        const classes = await this.classRepository.find({ _id: { $in: classIds } })
            .select('_id className description')
            .exec();
        return classes;
    }
}