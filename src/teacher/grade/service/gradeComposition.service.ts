import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GradeComposition, GradeCompositionDocument } from "../schema/gradeComposition.schema";
import { Model, Types } from "mongoose";
import { CreateGradeCompositionDto } from "../dto/createGradeComposition.dto";
import { User } from "src/user/schema/user.schema";
import { Class, ClassDocument } from "../schema/class.schema";
import { ClassUser } from "../schema/classUser.schema";


@Injectable()
export class GradeCompositionService {
    constructor(
        @InjectModel(GradeComposition.name) private readonly gradeCompositionRepository: Model<GradeCompositionDocument>,
        @InjectModel(Class.name) private readonly classRepository: Model<ClassDocument>,
        @InjectModel(ClassUser.name) private readonly classUserRepository: Model<ClassUser>,
    ) { }

    async checkIsHost(user: User, classId: string): Promise<any> {
        const clazz = await this.classRepository.findOne({ _id: classId, host: user._id }).exec();
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
        this.checkIsHost(user, dto.class_id);

        const gradeComposition = new this.gradeCompositionRepository({
            class_id: new Types.ObjectId(dto.class_id),
            gradeCompo_name: dto.name,
            gradeCompo_scale: dto.scale
        });
        await gradeComposition.save();
        return gradeComposition;
    }

    async getCurentGradeStructure(user: User, classId: string) {
        this.checkInClass(user, classId);

        const gradeComposition = await this.gradeCompositionRepository.find({ class_id: new Types.ObjectId(classId) })
            .select("gradeCompo_name gradeCompo_scale")
            .exec();

        return gradeComposition;
    }

    async removeGradeCompositions(user: User, classId: string, gradeCompoId: string) {
        this.checkIsHost(user, classId);
        try {
            const gradeComposition = await this.gradeCompositionRepository.findOneAndDelete(
                {
                    _id: new Types.ObjectId(gradeCompoId),
                    class_id: new Types.ObjectId(classId)
                }).exec();

            return { message: "Grade composition deleted" };
        }
        catch (err) {
            return new HttpException("Grade composition not found", HttpStatus.NOT_FOUND);
        }
    }

    async updateGradeCompositions(user: User, classId: string, gradeCompoId: string, dto: CreateGradeCompositionDto) {
        this.checkIsHost(user, classId);

        const gradeComposition = await this.gradeCompositionRepository.findOne({ _id: new Types.ObjectId(gradeCompoId), class_id: new Types.ObjectId(classId) }).exec();
        if (!gradeComposition) return new HttpException("Grade composition not found", HttpStatus.NOT_FOUND);

        gradeComposition.gradeCompo_name = dto.name;
        gradeComposition.gradeCompo_scale = dto.scale;
        await gradeComposition.save();
        return gradeComposition;
    }

    async getAcesndingGradeCompositions(user: User, classId: string) {
        this.checkInClass(user, classId);

        const gradeComposition = await this.gradeCompositionRepository.find({ class_id: new Types.ObjectId(classId) })
            .select("gradeCompo_name gradeCompo_scale")
            .sort({ gradeCompo_scale: 1 })
            .exec();

        return gradeComposition;
    }

    async getDescendingGradeCompositions(user: User, classId: string) {
        this.checkInClass(user, classId);

        const gradeComposition = await this.gradeCompositionRepository.find({ class_id: new Types.ObjectId(classId) })
            .select("gradeCompo_name gradeCompo_scale")
            .sort({ gradeCompo_scale: -1 })
            .exec();

        return gradeComposition;
    }
}