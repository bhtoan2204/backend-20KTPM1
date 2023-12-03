import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Class, ClassDocument } from "src/utils/schema/class.schema";
import { GradeReview, GradeReviewDocument } from "src/utils/schema/gradeReview.schema";
import { User, UserDocument } from "src/utils/schema/user.schema";

@Injectable()
export class GradeReviewService {
    constructor(
        @InjectModel(GradeReview.name) private gradeReviewRepository: Model<GradeReviewDocument>,
        @InjectModel(Class.name) private classRepository: Model<ClassDocument>,
        @InjectModel(User.name) private userRepository: Model<UserDocument>,
    ) { }

    async viewGradeReview(currentUser: User) {
        const class_ids = currentUser.classes.map((item) => item.class_id);
        return await this.gradeReviewRepository.find({ class_id: { $in: class_ids } }).exec();
    }

    async viewGradeReviewDetail(currentUser: User, gradeReviewId: string) {
        const gradeReview = await this.gradeReviewRepository.findOne({ _id: gradeReviewId }).exec();
        if (!gradeReview) {
            return new HttpException('Grade review not found', HttpStatus.NOT_FOUND);
        }
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
        // #TODO: check if currentUser is teacher of class

        const gradeReview = await this.gradeReviewRepository.findOne({ _id: dto.gradeReviewId }).exec();
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

    async markFinalGrade(currentUser: User, dto: any) {
        // #TODO: check if currentUser is teacher of class

        const gradeReview = await this.gradeReviewRepository.findOne({ _id: dto.gradeReviewId }).exec();
        if (!gradeReview) {
            return new HttpException('Grade review not found', HttpStatus.NOT_FOUND);
        }

        gradeReview.finalDecision.status = dto.status;
        gradeReview.finalDecision.updatedGrade = dto.updatedGrade;

        await gradeReview.save();

        // #TODO: update grade of student

        return {
            message: 'Mark final grade successful'
        };
    }
}