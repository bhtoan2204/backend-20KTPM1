import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Class, ClassDocument } from "src/utils/schema/class.schema";
import { ClassUser, ClassUserDocument } from "src/utils/schema/classUser.schema";
import { User, UserDocument } from "src/utils/schema/user.schema";
import { GetClassesFilterDto } from "./dto/getClassFilter.dto";
import { parse } from 'csv-parse';

type StudentId = {
    student_id: string;
}

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

    async getStudents(classid: string, page: number, itemPerPage: number = 10): Promise<any> {
        const classId = new Types.ObjectId(classid);

        try {
            const skipCount = (page - 1) * itemPerPage;

            const classUsers = await this.classUserRepository
                .aggregate([
                    { $match: { class_id: classId } },
                    { $unwind: "$students" },
                    {
                        $lookup: {
                            from: "users",
                            localField: "students.user_id",
                            foreignField: "_id",
                            as: "user",
                        },
                    },
                    { $unwind: "$user" },
                    {
                        $project: {
                            user: {
                                _id: 1,
                                email: 1,
                                fullname: 1,
                                avatar: 1,
                                login_type: 1,
                                is_ban: 1,
                            },
                            student_id: "$students.student_id",
                        },
                    },
                    { $skip: skipCount },
                    { $limit: itemPerPage },
                ]);

            return classUsers;
        } catch (error) {
            return { message: `Error: ${error.message}` };
        }
    }

    async getClassDetail(classId: string) {
        const classDetail = await this.classRepository
            .findOne({ _id: new Types.ObjectId(classId) })
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

    async manualMapStudentId(classId: string, userId: string, studentId: string) {
        const classObjectId = new Types.ObjectId(classId);
        const userObjectId = new Types.ObjectId(userId);
        try {
            await this.classUserRepository.updateOne(
                {
                    class_id: classObjectId,
                    'students.user_id': userObjectId,
                },
                {
                    $set: {
                        'students.$.student_id': studentId,
                    },
                }
            );
        } catch (error) {
            throw new Error('ClassUser document not found: ' + error.message);
        }
    }

    async mapStudentByExcel(classid: string, fileContent: Express.Multer.File) {
        const classId = new Types.ObjectId(classid);
        const classUsers = await this.classUserRepository.findOne({ class_id: classId });
        if (!classUsers) {
            throw new NotFoundException('Class not found');
        }

        const headers = ['student_id'];
        let data: StudentId[] = [];
        if (fileContent.originalname.endsWith('.csv')) {
            data = await new Promise<StudentId[]>((resolve, reject) => {
                parse(fileContent.buffer.toString(), {
                    delimiter: ',',
                    columns: headers,
                }, (error, result: StudentId[]) => {
                    if (error) {
                        console.error(error);
                        reject(error);
                    }
                    resolve(result);
                });
            });
        }
        else {
            throw new Error('File type not supported');
        }

        if (data.length + 1 < classUsers.students.length) {
            throw new Error('Number of student id is not enough');
        }

        for (let i = 0; i < classUsers.students.length; i++) {
            classUsers.students[i].student_id = data[i + 1].student_id;
        }
        await this.classUserRepository.updateOne({ class_id: classId }, { students: classUsers.students });

        return { message: 'Map student id successfully' };
    }
}