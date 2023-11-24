import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GradeComposition } from "./schema/gradeComposition.schema";
import { Types } from "mongoose";
import { User } from "../user/schema/user.schema";
import { CreateGradeCompositionDto } from "./dto/createGradeComposition.dto";
import { ClassService } from "../class/class.service";
import { Response } from 'express';
import * as fs from 'fs';
import * as fastcsv from 'fast-csv';


@Injectable()
export class GradeService {
    constructor(
        @InjectModel(GradeComposition.name) private readonly gradeCompositionModel,
        @Inject(ClassService) private readonly classService: ClassService,
    ) { }

    async createGradeComposition(user: User, dto: CreateGradeCompositionDto) {
        this.classService.checkIsHost(user, dto.class_id);

        const gradeComposition = new this.gradeCompositionModel({
            class_id: new Types.ObjectId(dto.class_id),
            gradeCompo_name: dto.name,
            gradeCompo_scale: dto.scale
        });
        await gradeComposition.save();
        return gradeComposition;
    }

    async getCurentGradeStructure(user: User, classId: string) {
        this.classService.checkInClass(user, classId);

        const gradeComposition = await this.gradeCompositionModel.find({ class_id: new Types.ObjectId(classId) })
            .select("gradeCompo_name gradeCompo_scale")
            .exec();

        return gradeComposition;
    }

    async removeGradeCompositions(user: User, classId: string, gradeCompoId: string) {
        this.classService.checkIsHost(user, classId);

        const gradeComposition = await this.gradeCompositionModel.findOne({ _id: new Types.ObjectId(gradeCompoId), class_id: new Types.ObjectId(classId) }).exec();
        if (!gradeComposition) return new HttpException("Grade composition not found", HttpStatus.NOT_FOUND);

        await gradeComposition.delete();
        return { message: "Grade composition deleted" };
    }

    async updateGradeCompositions(user: User, classId: string, gradeCompoId: string, dto: CreateGradeCompositionDto) {
        this.classService.checkIsHost(user, classId);

        const gradeComposition = await this.gradeCompositionModel.findOne({ _id: new Types.ObjectId(gradeCompoId), class_id: new Types.ObjectId(classId) }).exec();
        if (!gradeComposition) return new HttpException("Grade composition not found", HttpStatus.NOT_FOUND);

        gradeComposition.gradeCompo_name = dto.name;
        gradeComposition.gradeCompo_scale = dto.scale;
        await gradeComposition.save();
        return gradeComposition;
    }

    async getAcesndingGradeCompositions(user: User, classId: string) {
        this.classService.checkInClass(user, classId);

        const gradeComposition = await this.gradeCompositionModel.find({ class_id: new Types.ObjectId(classId) })
            .select("gradeCompo_name gradeCompo_scale")
            .sort({ gradeCompo_scale: 1 })
            .exec();

        return gradeComposition;
    }

    async getDescendingGradeCompositions(user: User, classId: string) {
        this.classService.checkInClass(user, classId);

        const gradeComposition = await this.gradeCompositionModel.find({ class_id: new Types.ObjectId(classId) })
            .select("gradeCompo_name gradeCompo_scale")
            .sort({ gradeCompo_scale: -1 })
            .exec();

        return gradeComposition;
    }

    async downloadListStudentCsv(user: User, classId: string, res: Response) {
        
    }
}