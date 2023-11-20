import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Class } from "./schema/class.schema";
import { Model } from "mongoose";
import { User } from "src/user/schema/user.schema";
import { CreateClassDto } from "./dto/createClass.dto";

@Injectable()
export class ClassService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<Class>,
    ) { }

    async create(host: User, dto: CreateClassDto): Promise<Class> {
        const newClass = new this.classModel({
            className: dto.className,
            description: dto.description,
            host: host._id,
            teachers: [host._id],
        });

        return await newClass.save();
    }

    async getAll(host: User): Promise<Class[]> {
        return await this.classModel.find({ host: host._id })
            .select('_id className description')
            .exec();
    }

    async getClassDetail(host: User, classId: string): Promise<Class> {
        const clazz = await this.classModel.findOne({ _id: classId, host: host._id })
            .select('className description teachers students')
            .exec();
        if (!clazz) throw new Error("Class not found");
        return clazz;
    }
}