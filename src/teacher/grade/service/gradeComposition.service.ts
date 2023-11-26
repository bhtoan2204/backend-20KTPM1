import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateGradeCompositionDto } from "../dto/createGradeComposition.dto";
import { Class, ClassDocument } from "src/utils/schema/class.schema";
import { ClassUser, ClassUserDocument } from "src/utils/schema/classUser.schema";
import { User } from "src/utils/schema/user.schema";


@Injectable()
export class GradeCompositionService {
    constructor(
        @InjectModel(Class.name) private readonly classRepository: Model<ClassDocument>,
        @InjectModel(ClassUser.name) private readonly classUserRepository: Model<ClassUserDocument>,
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

            const clazz = await this.classRepository.findOneAndUpdate(
                { _id: classId },
                {
                    $push: {
                        grade_compositions: {
                            gradeCompo_name: dto.name,
                            gradeCompo_scale: dto.scale,
                        }
                    }
                }).exec();

            return clazz.grade_compositions[clazz.grade_compositions.length - 1];
        }
        catch (err) {
            return new HttpException("Class not found or Composition Name is duplicated", HttpStatus.NOT_FOUND);
        }
    }

    async getCurentGradeStructure(user: User, classId: string) {
        this.checkInClass(user, classId);

        return await this.classRepository.findOne({ _id: classId }).select("grade_compositions").exec();
    }

    async removeGradeCompositions(user: User, classId: string, gradeCompoName: string) {
        this.checkIsHost(user, classId);
        try {
            const clazz = await this.classRepository.findOneAndUpdate(
                { _id: classId },
                {
                    $pull: {
                        grade_compositions: {
                            gradeCompoName
                        }
                    }
                }).exec();
            return clazz.grade_compositions;
        }
        catch (err) {
            return new HttpException("Grade composition not found", HttpStatus.NOT_FOUND);
        }
    }

    async updateGradeCompositions(user: User, dto: CreateGradeCompositionDto, oldName: string) {
        this.checkIsHost(user, dto.class_id);

        const clazz = await this.classRepository.findOneAndUpdate(
            { _id: new Types.ObjectId(dto.class_id), "grade_compositions.gradeCompo_name": oldName },
            {
                $set: {
                    "grade_compositions.$.gradeCompo_name": dto.name,
                    "grade_compositions.$.gradeCompo_scale": dto.scale,
                }
            }).exec();

        return clazz?.grade_compositions.find(compo => compo.gradeCompo_name === dto.name);
    }
}