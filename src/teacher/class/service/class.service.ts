import { ConflictException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateClassDto } from "../dto/createClass.dto";
import { Types } from 'mongoose';
import { UserService } from "src/user/user.service";
import { Class, ClassDocument } from "src/utils/schema/class.schema";
import { ClassUser, ClassUserDocument } from "src/utils/schema/classUser.schema";
import { User, UserDocument } from "src/utils/schema/user.schema";

@Injectable()
export class ClassService {
    constructor(
        @InjectModel(Class.name) private readonly classRepository: Model<ClassDocument>,
        @InjectModel(ClassUser.name) private readonly classUserRepository: Model<ClassUserDocument>,
        @InjectModel(User.name) private readonly userRepository: Model<UserDocument>,
    ) { }

    async checkInClass(user: User, classId: Types.ObjectId): Promise<any> {
        const classUser = await this.classUserRepository.findOne({
            class_id: classId,
        }).exec();

        const check = classUser.teachers.findIndex(teacher => teacher.user_id == user._id);

        if (check === -1) {
            return new HttpException('You are not in this class', HttpStatus.FORBIDDEN);
        }
    }

    async checkIsHost(user: User, classId: Types.ObjectId): Promise<any> {
        const clazz = await this.classRepository.findOne({ _id: classId, host: user._id }).exec();
        if (!clazz) {
            return new HttpException('You are not the host of this class', HttpStatus.FORBIDDEN);
        }
    }

    async create(host: User, dto: CreateClassDto): Promise<any> {
        const newClass = new this.classRepository({
            className: dto.className,
            description: dto.description,
            host: host._id,
        });

        const newClassUser = await this.classUserRepository.create({
            class_id: newClass._id,
            teachers: [{ user_id: host._id }]
        });

        const user = await this.userRepository.findOne({ _id: host._id });
        user.classes.push({
            class_id: newClass._id,
            class_name: dto.className,
            class_description: dto.description
        });

        await newClass.save();
        await newClassUser.save();
        await user.save();

        return {
            message: "Create class successfully",
            class: {
                class_id: newClass._id,
                class_name: dto.className,
                class_description: dto.description
            }
        };
    }

    async deleteClass(host: User, classid: string): Promise<any> {
        const classId = new Types.ObjectId(classid);
        this.checkIsHost(host, classId);

        const clazz = await this.classRepository.findOne({ _id: classId, host: host._id }).exec();
        if (!clazz) return new NotFoundException("Class not found");

        await this.classRepository.findOneAndDelete({ _id: classId, host: host._id }).exec();
        await this.classUserRepository.findOneAndDelete({ class_id: classId }).exec();

        return new HttpException("Delete class successfully", HttpStatus.OK);
    }

    async getAll(user: User): Promise<any> {
        const classIds = user.classes.map(clazz => clazz.class_id);
        const classes = await this.classRepository.find({ _id: { $in: classIds } })
            .select('_id className description')
            .exec();

        if (!classes || classes.length === 0) {
            return new NotFoundException('No classes found for the given user');
        }

        return classes;
    }

    async getJoinedClasses(user: User): Promise<any> {
        const classes = await this.classRepository.find({ host: user._id })
            .select('_id className description')
            .exec();

        if (!classes || classes.length === 0) {
            return new NotFoundException('No classes found for the given host');
        }

        return classes;
    }

    async getClassDetail(host: User, classid: string): Promise<any> {
        const classId = new Types.ObjectId(classid);
        this.checkInClass(host, classId);

        const clazz = await this.classRepository.findOne({ _id: classId, host: host._id })
            .select('_id className description')
            .exec();

        if (!clazz) return new ConflictException("You already in this class");

        return clazz;
    }

    async getTeachers(user: User, classid: string): Promise<any> {
        const classId = new Types.ObjectId(classid);

        this.checkInClass(user, classId);

        try {
            const classUsers = await this.classUserRepository.find({ class_id: new Types.ObjectId(classId) });
            const userIds = classUsers.map(classUser => classUser.teachers.map(teachers => teachers.user_id));
            const teachers = await this.userRepository.find({ _id: { $in: userIds } });
            return teachers;
        }
        catch (error) {
            return { message: `Error: ${error.message}` };
        }
    }

    async getStudents(host: User, classid: string): Promise<any> {
        const classId = new Types.ObjectId(classid);
        this.checkInClass(host, classId);
        try {
            const classUsers = await this.classUserRepository.find({ class_id: classId });
            const userIds = classUsers.map(classUser => classUser.students.map(student => student.user_id));
            const students = await this.userRepository.find({ _id: { $in: userIds } });
            return students;
        }
        catch (error) {
            return { message: `Error: ${error.message}` };
        }
    }
}