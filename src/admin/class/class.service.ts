import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Class, ClassDocument } from "src/utils/schema/class.schema";
import { ClassUser, ClassUserDocument } from "src/utils/schema/classUser.schema";
import { User, UserDocument } from "src/utils/schema/user.schema";
import { GetClassesFilterDto } from "./dto/getClassFilter.dto";

@Injectable()
export class ClassAdminService {
    constructor(
        @InjectModel(User.name) private readonly userRepository: Model<UserDocument>,
        @InjectModel(Class.name) private readonly classRepository: Model<ClassDocument>,
        @InjectModel(ClassUser.name) private readonly classUserRepository: Model<ClassUserDocument>
    ) { }

    async getClasses(dto: GetClassesFilterDto) {
        let countQueryBuilder = this.classRepository.find();
        if (dto.is_active !== undefined && dto.is_active !== null) {
            countQueryBuilder = countQueryBuilder.where('is_active').equals(dto.is_active);
        }
        const totalCount = await countQueryBuilder.countDocuments().exec();

        let queryBuilder = this.classRepository.find()
            .populate({
                path: 'host',
                model: 'User',
                select: 'fullname',
            })
            .lean();

        if (dto.is_active !== undefined && dto.is_active !== null) {
            queryBuilder = queryBuilder.where('is_active').equals(dto.is_active);
        }

        if (dto.is_descending) {
            queryBuilder = queryBuilder.sort({ createdAt: -1 });
        }

        if (dto.page !== undefined && dto.itemPerPage !== undefined) {
            const startIndex = (dto.page - 1) * dto.itemPerPage;
            queryBuilder = queryBuilder.skip(startIndex).limit(dto.itemPerPage);
        }

        const classesWithHostName = await queryBuilder.exec();
        return { classesWithHostName, totalCount };
    }

    async getTeachers(classid: string, page: number, itemPerPage): Promise<any> {
        const classId = new Types.ObjectId(classid);
        try {
            const classUsers = await this.classUserRepository.find({ class_id: new Types.ObjectId(classId) });
            const userIds = classUsers.flatMap(classUser => classUser.teachers.map(teachers => teachers.user_id));
            const skipCount = (page - 1) * itemPerPage;
            const teachers = await this.userRepository.find(
                { _id: { $in: userIds } },
                {
                    password: 0,
                    role: 0,
                    birthday: 0,
                    refreshToken: 0,
                    classes: 0,
                }
            ).limit(itemPerPage).skip(skipCount);

            return teachers;
        } catch (error) {
            return { message: `Error: ${error.message}` };
        }
    }

    async getStudents(classid: string, page: number, itemPerPage): Promise<any> {
        const classId = new Types.ObjectId(classid);
        try {
            const classUsers = await this.classUserRepository.find({ class_id: new Types.ObjectId(classId) });
            const userIds = classUsers.flatMap(classUser => classUser.students.map(student => student.user_id));
            const skipCount = (page - 1) * itemPerPage;
            const teachers = await this.userRepository.find(
                { _id: { $in: userIds } },
                {
                    password: 0,
                    role: 0,
                    birthday: 0,
                    refreshToken: 0,
                    classes: 0,
                }
            ).limit(itemPerPage).skip(skipCount);

            return teachers;
        } catch (error) {
            return { message: `Error: ${error.message}` };
        }
    }

    async getClassDetail(classId: string) {
        const classDetail = await this.classRepository
            .findOne({ _id: new Types.ObjectId(classId) })
            .lean()
            .populate({
                path: 'host',
                model: 'User',
                select: 'fullname avatar',
            })
            .exec();
        return classDetail;
    }

    async activateClass(classId: string) {
        const classDetail = await this.classRepository.findOne({ _id: new Types.ObjectId(classId) });
        classDetail.is_active = !classDetail.is_active;
        await classDetail.save();
        return { message: classDetail.is_active ? 'Activate class successfully' : 'Deactivate class successfully' };
    }
}