import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateGradeCompositionDto } from "../../dto/createGradeComposition.dto";
import { Class, ClassDocument } from "src/utils/schema/class.schema";
import { ClassUser, ClassUserDocument } from "src/utils/schema/classUser.schema";
import { User } from "src/utils/schema/user.schema";
import { RemoveGradeCompositionDto } from "src/teacher/dto/deleteGradeComposition.dto";
import { UpdateGradeCompositionDto } from "src/teacher/dto/updateGradeComposition.dto";
import { SwapGradeCompositionDto } from "src/teacher/dto/swapGradeComposition.dto";
import { UserGrade, UserGradeDocument } from "src/utils/schema/userGrade.schema";


@Injectable()
export class GradeCompositionService {
    constructor(
        @InjectModel(Class.name) private readonly classRepository: Model<ClassDocument>,
        @InjectModel(ClassUser.name) private readonly classUserRepository: Model<ClassUserDocument>,
        @InjectModel(UserGrade.name) private readonly userGradeRepository: Model<UserGradeDocument>,
    ) { }

    async checkIsHost(user: User, classId: string): Promise<any> {
        const clazz = await this.classRepository.findOne({ _id: new Types.ObjectId(classId), host: user._id }).exec();
        if (!clazz) {
            return new HttpException('You are not the host of this class', HttpStatus.FORBIDDEN);
        }
    }

    private async checkInClass(user: User, classId: string): Promise<any> {
        const classUser = await this.classUserRepository.findOne({ user_id: user._id, class_id: classId }).exec();
        if (classUser == null) {
            return new HttpException('You are not in this class', HttpStatus.FORBIDDEN);
        }
    }

    async createGradeComposition(user: User, dto: CreateGradeCompositionDto) {
        try {
            this.checkIsHost(user, dto.class_id);
            const classId = new Types.ObjectId(dto.class_id);

            const clazz = await this.classRepository.findOne(
                { _id: classId }).exec();

            if (!clazz) {
                return new HttpException("Class not found", HttpStatus.NOT_FOUND);
            }

            if (clazz.grade_compositions.findIndex((item) => item.gradeCompo_name == dto.name) != -1) {
                return new HttpException("Grade composition name is duplicated", HttpStatus.BAD_REQUEST);
            }

            clazz.grade_compositions.push({
                gradeCompo_name: dto.name,
                gradeCompo_scale: dto.scale,
                is_finalized: false
            });

            await clazz.save();

            const students = await this.userGradeRepository.find({ class_id: classId }).exec();
            for (let i = 0; i < students.length; i++) {
                const newGrade = {
                    gradeCompo_name: dto.name,
                    gradeCompo_scale: dto.scale,
                    current_grade: null,
                }
                students[i].grades.push(newGrade);
                students[i].save();
            };

            return {
                message: "Create GradeComposition successful",
            };
        }
        catch (err) {
            return new HttpException(err, HttpStatus.NOT_FOUND);
        }
    }

    async getCurentGradeStructure(user: User, classId: string) {
        this.checkInClass(user, classId);
        try {
            const clazz = await this.classRepository.findOne({ _id: new Types.ObjectId(classId) }).exec();
            if (!clazz) {
                return new HttpException("Class not found", HttpStatus.NOT_FOUND);
            }

            return clazz.grade_compositions
        }
        catch (err) {
            return new HttpException("Class not found", HttpStatus.NOT_FOUND);
        }
    }

    async removeGradeCompositions(user: User, dto: RemoveGradeCompositionDto) {
        this.checkIsHost(user, dto.class_id);
        try {
            const clazz = await this.classRepository.findOne({ _id: new Types.ObjectId(dto.class_id) }).exec();
            const index = clazz.grade_compositions.findIndex((item) => item.gradeCompo_name == dto.name);
            if (index == -1) {
                return new HttpException("Grade composition not found", HttpStatus.NOT_FOUND);
            }
            clazz.grade_compositions.splice(index, 1);

            const students = await this.userGradeRepository.find({ class_id: dto.class_id }).exec();
            for (let i = 0; i < students.length; i++) {
                students[i].grades.splice(index, 1);
            };

            return await clazz.save();
        }
        catch (err) {
            return new HttpException("Grade composition not found", HttpStatus.NOT_FOUND);
        }
    }

    async updateGradeCompositions(user: User, dto: UpdateGradeCompositionDto) {
        try {
            this.checkIsHost(user, dto.class_id);
            const classId = new Types.ObjectId(dto.class_id);
            const clazz = await this.classRepository.findOne({ _id: classId }).exec();
            if (!clazz) {
                return new HttpException("Class not found", HttpStatus.NOT_FOUND);
            }

            const index = clazz.grade_compositions.findIndex((item) => item.gradeCompo_name == dto.oldName);
            if (index == -1) {
                return new HttpException("Grade composition not found", HttpStatus.NOT_FOUND);
            }
            clazz.grade_compositions[index].gradeCompo_name = dto.name;
            clazz.grade_compositions[index].gradeCompo_scale = dto.scale;

            const students = await this.userGradeRepository.find({ class_id: classId }).exec();
            for (let i = 0; i < students.length; i++) {
                students[i].grades[index].gradeCompo_name = dto.name;
                students[i].grades[index].gradeCompo_scale = dto.scale;
                students[i].save();
            };

            return await clazz.save();

        } catch (err) {
            return new HttpException("Error updating GradeComposition", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async swapGradeCompositions(user: User, dto: SwapGradeCompositionDto) {
        try {
            this.checkIsHost(user, dto.class_id);
            const classId = new Types.ObjectId(dto.class_id);
            const clazz = await this.classRepository.findOne({ _id: classId }).exec();
            if (!clazz) {
                return new HttpException("Class not found", HttpStatus.NOT_FOUND);
            }

            const index1 = clazz.grade_compositions.findIndex((item) => item.gradeCompo_name == dto.firstName);
            const index2 = clazz.grade_compositions.findIndex((item) => item.gradeCompo_name == dto.secondName);
            if (index1 == -1 || index2 == -1) {
                return new HttpException("Grade composition not found", HttpStatus.NOT_FOUND);
            }

            const temp = clazz.grade_compositions[index1];
            clazz.grade_compositions[index1] = clazz.grade_compositions[index2];
            clazz.grade_compositions[index2] = temp;

            const students = await this.userGradeRepository.find({ class_id: classId }).exec();
            for (let i = 0; i < students.length; i++) {
                const temp = students[i].grades[index1];
                students[i].grades[index1] = students[i].grades[index2];
                students[i].grades[index2] = temp;
                students[i].save();
            };

            return await clazz.save();

        } catch (err) {
            return new HttpException("Error updating GradeComposition", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}