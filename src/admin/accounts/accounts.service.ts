import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User, UserDocument } from "src/utils/schema/user.schema";
import { GetUserFilterDto } from "./dto/getUserFilter.dto";
import { Class, ClassDocument } from "src/utils/schema/class.schema";

@Injectable()
export class AccountsService {
    constructor(
        @InjectModel(User.name) private readonly userRepository: Model<UserDocument>,
        @InjectModel(Class.name) private readonly classRepository: Model<ClassDocument>,
    ) { }

    async getUsers(filter: GetUserFilterDto) {
        const { role, page, perPage } = filter;

        const query: Record<string, any> = {};

        if (role) {
            query.role = role;
        }

        const skip = (page - 1) * perPage;
        const users = await this.userRepository
            .find(query)
            .skip(skip)
            .limit(perPage)
            .select('-password')
            .exec();

        return users;
    }

    async banAccount(userId: string) {
        try {
            const user = await this.userRepository.findById(new Types.ObjectId(userId));
            if (!user) {
                throw new Error("User not found");
            }
            user.is_ban = !user.is_ban;
            await user.save();

            return { message: (user.is_ban) ? "Ban successfully" : "Unban successfully" };
        }
        catch (err) {
            throw err;
        }
    }

    async userDetail(userId: string) {
        return this.userRepository.findById(new Types.ObjectId(userId)).select('-password').exec();
    }

    async getClasses() {
        return this.classRepository.find().exec();
    }

    async getStatistics() {
        const totalTeacher = await this.userRepository.countDocuments({ role: 'teacher' }).exec();
        const totalStudent = await this.userRepository.countDocuments({ role: 'student' }).exec();
        const totalClass = await this.classRepository.countDocuments().exec();

        return {
            totalTeacher,
            totalStudent,
            totalClass,
        }
    }
}