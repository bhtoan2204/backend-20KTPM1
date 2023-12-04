import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { PostCommentDto } from "src/student/dto/postComment.dto";
import { RequestReviewDto } from "src/student/dto/requestReview.dto";
import { Class, ClassDocument } from "src/utils/schema/class.schema";
import { ClassUser, ClassUserDocument } from "src/utils/schema/classUser.schema";
import { GradeReview, GradeReviewDocument } from "src/utils/schema/gradeReview.schema";
import { User, UserDocument } from "src/utils/schema/user.schema";
import { UserGrade, UserGradeDocument } from "src/utils/schema/userGrade.schema";

@Injectable()
export class GradeViewerService {
    constructor(
        @InjectModel(ClassUser.name) private readonly classUserRepository: Model<ClassUserDocument>,
        @InjectModel(UserGrade.name) private readonly userGradeRepository: Model<UserGradeDocument>,
        @InjectModel(Class.name) private readonly classRepository: Model<ClassDocument>,
        @InjectModel(GradeReview.name) private readonly gradeReviewRepository: Model<GradeReviewDocument>,
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

    async requestReview(user: User, dto: RequestReviewDto) {
        const classId = new Types.ObjectId(dto.class_id);
        const clazz = await this.classRepository.findOne({ _id: classId }).exec();
        if (!clazz) {
            return new HttpException("Class not found", HttpStatus.NOT_FOUND);
        }
        this.checkInClass(user, classId);
        const userGrade = await this.userGradeRepository.findOne({
            user_id: user._id,
            class_id: classId,
        });
        const grade = userGrade.grades.find((grade) => grade.gradeCompo_name === dto.gradeCompo_name);
        if (!grade) {
            return new HttpException("Grade composition not found", HttpStatus.NOT_FOUND);
        }
        const is_finalized = clazz.grade_compositions.find((grade) => grade.gradeCompo_name === dto.gradeCompo_name).is_finalized;
        if (!is_finalized) {
            return new HttpException("Grade composition is not finalized", HttpStatus.FORBIDDEN);
        }
        const gradeReview = await this.gradeReviewRepository.findOne({
            user_id: user._id,
            class_id: classId,
            gradeCompo_name: dto.gradeCompo_name,
        });
        if (gradeReview) {
            return new HttpException("You have already requested a review", HttpStatus.FORBIDDEN);
        }
        const newGradeReview = new this.gradeReviewRepository({
            class_id: classId,
            student_id: user._id,
            gradeCompo_name: dto.gradeCompo_name,
            expected_grade: dto.expected_grade,
            student_explain: dto.explaination,
            comments: [],
            finalDecision: {
                status: 'PENDING',
                updatedGrade: 0
            }
        });
        return await newGradeReview.save();
    }

    async viewGradeReview(user: User, reviewId: string) {
        const review = await this.gradeReviewRepository.findOne({ _id: reviewId });
        if (!review) {
            return new HttpException("Review not found", HttpStatus.NOT_FOUND);
        }
        if (review.student_id.toString() !== user._id.toString()) {
            return new HttpException("You are not allowed to view this review", HttpStatus.FORBIDDEN);
        }
        return review;
    }

    async postAComment(user: User, dto: PostCommentDto) {
        const review = await this.gradeReviewRepository.findOne({ _id: new Types.ObjectId(dto.gradeReview_id) });
        if (!review) {
            return new HttpException("Review not found", HttpStatus.NOT_FOUND);
        }
        if (review.student_id.toString() !== user._id.toString()) {
            return new HttpException("You are not allowed to post a comment", HttpStatus.FORBIDDEN);
        }
        review.comments.push({
            commenter: user.fullname.toString(),
            text: dto.content
        });
        return await review.save();
    }
}