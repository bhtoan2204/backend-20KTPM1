import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Class, ClassDocument } from "src/utils/schema/class.schema";
import { ClassUser, ClassUserDocument } from "src/utils/schema/classUser.schema";
import { User, UserDocument } from "src/utils/schema/user.schema";
import { UserGrade, UserGradeDocument } from "src/utils/schema/userGrade.schema";

@Injectable()
export class GradeViewerService {
    constructor(
        @InjectModel(ClassUser.name) private readonly classUserRepository: Model<ClassUserDocument>,
        @InjectModel(UserGrade.name) private readonly userGradeRepository: Model<UserGradeDocument>,
        @InjectModel(Class.name) private readonly classRepository: Model<ClassDocument>,
    ) { }

    async checkInClass(user: User, classId: Types.ObjectId): Promise<any> {
        const userGrade = await this.userGradeRepository.findOne({
            user_id: user._id,
            class_id: classId,
        })
        if (!userGrade) {
            return new HttpException('You are not in this class', HttpStatus.FORBIDDEN);
        }
    }

    async viewGradeCompostitions(user: User, classid: string) {
        const classId = new Types.ObjectId(classid);
        const clazz = await this.classRepository.findOne({ _id: classId }).exec();
        if (!clazz) {
            return new HttpException("Class not found", HttpStatus.NOT_FOUND);
        }
        this.checkInClass(user, classId);

        const userGrade = await this.userGradeRepository.findOne({
            user_id: user._id,
            class_id: classId,
        });
        const combinedData = clazz.grade_compositions.map((classGrade) => {
            const userGradeDetail = userGrade.grades.find((grade) => grade.gradeCompo_name === classGrade.gradeCompo_name);
            return {
                gradeCompo_name: classGrade.gradeCompo_name,
                gradeCompo_scale: classGrade.gradeCompo_scale,
                current_grade: userGradeDetail ? userGradeDetail.current_grade : null,
                is_finalized: classGrade.is_finalized,
            };
        })
        let rows = []
        let total_scale = 0
        let user_total = 0
        combinedData.forEach((item) => {
            if (item.is_finalized) {
                rows.push(item);
                user_total += (item.current_grade) ? item.current_grade : 0
            }
            else {
                rows.push({
                    gradeCompo_name: item.gradeCompo_name,
                    gradeCompo_scale: item.gradeCompo_scale,
                    current_grade: null,
                    is_finalized: false
                })
            }
            total_scale += item.gradeCompo_scale
        })

        return {
            rows, total_scale, user_total
        };
    }
}