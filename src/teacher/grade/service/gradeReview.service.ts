import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MarkFinalDescistionDto } from "src/teacher/dto/markFinalDescistion.dto";
import { RealStatus } from "src/utils/enum/realStatus.enum";
import { Status } from "src/utils/enum/status.enum";
import { Class, ClassDocument } from "src/utils/schema/class.schema";
import { GradeReview, GradeReviewDocument } from "src/utils/schema/gradeReview.schema";
import { User, UserDocument } from "src/utils/schema/user.schema";
import { UserGrade, UserGradeDocument } from "src/utils/schema/userGrade.schema";

@Injectable()
export class GradeReviewService {
    constructor(
        @InjectModel(GradeReview.name) private gradeReviewRepository: Model<GradeReviewDocument>,
        @InjectModel(Class.name) private classRepository: Model<ClassDocument>,
        @InjectModel(User.name) private userRepository: Model<UserDocument>,
        @InjectModel(UserGrade.name) private userGradeRepository: Model<UserGradeDocument>,
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

    async viewGradeReview(currentUser: User, classid: string) {
        const classId = new Types.ObjectId(classid);
        const clazz = await this.classRepository.findOne({ _id: classId }).exec();
        if (!clazz) {
            return new HttpException("Class not found", HttpStatus.NOT_FOUND);
        }
        this.checkInClass(currentUser, classId);

        return await this.gradeReviewRepository.find({ class_id: classId }).exec();
    }

    async viewGradeReviewDetail(currentUser: User, gradeReviewId: string) {
        const gradeReview = await this.gradeReviewRepository.findOne({ _id: gradeReviewId }).exec();
        if (!gradeReview) {
            return new HttpException('Grade review not found', HttpStatus.NOT_FOUND);
        }
        const clazz = await this.classRepository.findOne({ _id: gradeReview.class_id }).exec();
        if (!clazz) {
            return new HttpException('Class not found', HttpStatus.NOT_FOUND);
        }
        this.checkInClass(currentUser, gradeReview.class_id);

        const student = await this.userRepository.findOne(
            { _id: gradeReview.student_id },
            { student_id: 1, fullname: 1 }
        ).exec();

        delete gradeReview.student_id;

        return {
            student,
            gradeReview
        };
    }

    async commentGradeReview(currentUser: User, dto: any) {
        const classId = new Types.ObjectId(dto.classId);
        const gradeReviewId = new Types.ObjectId(dto.gradeReviewId);

        this.checkInClass(currentUser, classId);

        const gradeReview = await this.gradeReviewRepository.findOne({ _id: gradeReviewId }).exec();
        if (!gradeReview) {
            return new HttpException('Grade review not found', HttpStatus.NOT_FOUND);
        }

        gradeReview.comments.push({
            commenter: currentUser.fullname,
            text: dto.comment
        });

        await gradeReview.save();

        return {
            message: 'Comment grade review successful'
        };
    }

    async markFinalGrade(currentUser: User, dto: MarkFinalDescistionDto) {
        const gradeReviewId = new Types.ObjectId(dto.gradeReview_id);
        const gradeReview = await this.gradeReviewRepository.findOne({ _id: gradeReviewId }).exec();
        if (!gradeReview) {
            return new HttpException('Grade review not found', HttpStatus.NOT_FOUND);
        }
        if (gradeReview.finalDecision.status !== Status.PENDING) {
            return new HttpException('Final decision has already been made', HttpStatus.FORBIDDEN);
        }
        const classId = gradeReview.class_id;
        this.checkInClass(currentUser, classId);

        if (dto.status === RealStatus.APPROVED) {
            gradeReview.finalDecision = {
                status: Status.APPROVED,
                updatedGrade: gradeReview.expected_grade
            }
            const grade = await this.userGradeRepository.findOneAndUpdate(
                { class_id: gradeReview.class_id, user_id: gradeReview.student_id, "class_grades.grades.gradeCompo_name": gradeReview.gradeCompo_name },
                { $set: { "class_grades.$.grades.$.current_grade": gradeReview.expected_grade } },
                { new: true }
            ).exec();

            gradeReview.save();

            return {
                message: 'Grade Review approved',
                grade: grade
            };
        }
        else if (dto.status === RealStatus.REJECTED) {
            gradeReview.finalDecision.status = Status.REJECTED;

            return {
                message: 'Grade Review rejected'
            };
        }
    }
}