import { ForbiddenException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MapStudentIdDto } from "src/student/dto/mapStudentId.dto";
import { Class, ClassDocument } from "src/utils/schema/class.schema";
import { ClassUser, ClassUserDocument } from "src/utils/schema/classUser.schema";
import { Invitation, InvitationDocument } from "src/utils/schema/invitation.schema";
import { User, UserDocument } from "src/utils/schema/user.schema";
import { UserGrade, UserGradeDocument } from "src/utils/schema/userGrade.schema";

@Injectable()
export class ClassService {
    constructor(
        @InjectModel(Class.name) private readonly classRepository: Model<ClassDocument>,
        @InjectModel(ClassUser.name) private readonly classUserRepository: Model<ClassUserDocument>,
        @InjectModel(Invitation.name) private readonly invitationRepository: Model<InvitationDocument>,
        @InjectModel(User.name) private readonly userRepository: Model<UserDocument>,
        @InjectModel(UserGrade.name) private readonly userGradeRepository: Model<UserGradeDocument>,
    ) { }

    async checkInClassForView(user: User, classId: Types.ObjectId): Promise<any> {
        const classUser = await this.classUserRepository.findOne({
            class_id: classId,
        });

        classUser.students.forEach(student => {
            if (student.user_id.equals(user._id)) {
                return true;
            }
        });

        return false;
    }

    async joinClass(user: User, classToken: string, classid: string): Promise<any> {
        const classId = new Types.ObjectId(classid);
        const clazzz = await this.classRepository.findOne({ _id: classId }).exec();
        if (!clazzz) {
            return new NotFoundException("Class not found");
        }
        const invitation = await this.invitationRepository.findOne({ class_id: classId, class_token: classToken }).exec();
        if (!invitation) {
            return new NotFoundException("Invitation not found");
        }
        const classUser = await this.classUserRepository.findOne(
            { class_id: classId },
        )
        classUser.students.push({
            user_id: user._id,
            student_id: `${classUser.students.length + 1}-2023`
        });
        classUser.save();
        const clazz = await this.classRepository.findOne({ _id: classId }).exec();
        const updatedUser = await this.userRepository.findOne({ _id: user._id })
        updatedUser.classes.push({
            class_id: classId,
            class_name: clazz.className,
            class_description: clazz.description,
        })
        updatedUser.save();

        const grades = clazz.grade_compositions.map(comp => ({
            gradeCompo_name: comp.gradeCompo_name,
            gradeCompo_scale: comp.gradeCompo_scale,
            current_grade: null,
        }));

        const newUserGrade = {
            user_id: user._id,
            classId: classId,
            grades: grades,
        }
        await this.userGradeRepository.create(newUserGrade);

        return { message: "Join class successfully" };
    }

    async joinClassByClassId(user: User, classid: string): Promise<any> {
        const classId = new Types.ObjectId(classid);
        const clazzz = await this.classRepository.findOne({ _id: classId }).exec();
        if (!clazzz) {
            return new NotFoundException("Class not found");
        }
        const classUser = await this.classUserRepository.findOne(
            { class_id: classId },
        )
        classUser.students.push({
            user_id: user._id,
            student_id: `${classUser.students.length + 1}-2023`
        });
        classUser.save();

        const clazz = await this.classRepository.findOne({ _id: classId }).exec();

        const updatedUser = await this.userRepository.findOne({ _id: user._id })

        updatedUser.classes.push({
            class_id: classId,
            class_name: clazz.className,
            class_description: clazz.description,
        })
        updatedUser.save();

        const grades = clazz.grade_compositions.map(comp => ({
            gradeCompo_name: comp.gradeCompo_name,
            gradeCompo_scale: comp.gradeCompo_scale,
            current_grade: null,
        }));

        const newUserGrade = {
            user_id: user._id,
            class_id: classId,
            grades: grades,
        }
        console.log

        await this.userGradeRepository.create(newUserGrade);

        return { message: "Join class successfully" };
    }

    getJoinedClasses(user: User) {
        return user.classes;
    }

    async viewGradeStructure(user: User, classid: string) {
        const classId = new Types.ObjectId(classid);
        const clazzz = await this.classRepository.findOne({ _id: classId }).exec();
        if (!clazzz) return new NotFoundException("Class not found");
        if (!this.checkInClassForView(user, new Types.ObjectId(classId))) {
            return new ForbiddenException('You are already in this class')
        }
        const clazz = await this.classRepository.findOne({ _id: classId });
        return clazz.grade_compositions;
    }

    async viewClassMembers(user: User, classid: string) {
        const classId = new Types.ObjectId(classid);
        const clazzz = await this.classRepository.findOne({ _id: classId }).exec();
        if (!clazzz) return new NotFoundException("Class not found");

        if (!this.checkInClassForView(user, classId)) {
            return new ForbiddenException('You are not in in this class')
        }
        const classUser = await this.classUserRepository.findOne({
            class_id: new Types.ObjectId(classId)
        })
        const studentIds = classUser.students.map(student => student.user_id);
        const students = await this.userRepository.find({ _id: { $in: studentIds, $ne: user._id } }).select("fullname email").exec();

        return students;
    }

    async viewClassTeachers(user: User, classid: string) {
        const classId = new Types.ObjectId(classid);
        const clazzz = await this.classRepository.findOne({ _id: classId }).exec();
        if (!clazzz) return new NotFoundException("Class not found");
        if (!this.checkInClassForView(user, new Types.ObjectId(classId))) {
            return new ForbiddenException('You are not in in this class')
        }
        const classUser = await this.classUserRepository.findOne({
            class_id: new Types.ObjectId(classId)
        })
        const teacherIds = classUser.teachers.map(teacher => teacher.user_id);
        const teachers = await this.userRepository.find({ _id: { $in: teacherIds } }).select("fullname email").exec();

        return teachers;
    }

    async mapStudentId(user: User, dto: MapStudentIdDto) {
        const classId = new Types.ObjectId(dto.class_id);
        const clazz = await this.classRepository.findOne({ _id: classId }).exec();
        if (!clazz) return new NotFoundException("Class not found");
        const classUser = await this.classUserRepository.findOne({
            class_id: new Types.ObjectId(classId)
        })
        const student = classUser.students.map(student => student.user_id === user._id);
        if (!student) return new NotFoundException("You are not in this class");

        const updatedClassUser = await this.classUserRepository.findOneAndUpdate(
            { class_id: classId, 'students.user_id': user._id },
            { $set: { 'students.$.student_id': dto.new_studentId } },
            { new: true }
        ).exec();

        if (!updatedClassUser) {
            throw new HttpException('Student not found or student_id not updated', HttpStatus.NOT_FOUND);
        }

        return {
            message: 'Map student id successful'
        };
    }

    async leaveClass(user: User, classid: string) {
        const classId = new Types.ObjectId(classid);
        const clazzz = await this.classRepository.findOne({ _id: classId }).exec();
        if (!clazzz) return new NotFoundException("Class not found");
        const classUser = await this.classUserRepository.findOne({
            class_id: new Types.ObjectId(classId)
        })
        const student = classUser.students.map(student => student.user_id === user._id);
        if (!student) return new NotFoundException("You are not in this class");
    }
}