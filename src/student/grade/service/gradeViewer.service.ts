import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ClassUser, ClassUserDocument } from "src/utils/schema/classUser.schema";
import { User } from "src/utils/schema/user.schema";

@Injectable()
export class GradeViewerService {
    constructor(
        @InjectModel(ClassUser.name) private readonly classUserRepository: Model<ClassUserDocument>,
    ) { }

    async viewGradeCompostitions(user: User, classId: string) {
        const classUser = await this.classUserRepository.findOne({
            
        })
    }
}