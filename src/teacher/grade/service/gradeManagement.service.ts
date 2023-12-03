import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Workbook } from "exceljs";
import { Model, Types } from "mongoose";
import * as tmp from 'tmp';
import { StorageService } from "src/storage/storage.service";
import { ClassUser, ClassUserDocument } from "src/utils/schema/classUser.schema";
import { User, UserDocument } from "src/utils/schema/user.schema";
import { Class, ClassDocument } from "src/utils/schema/class.schema";
import { UserGrade, UserGradeDocument } from "src/utils/schema/userGrade.schema";
import { InputGradeDto } from "src/teacher/dto/inputGrade.dto";

@Injectable()
export class GradeManagementService {
    constructor(
        @InjectModel(ClassUser.name) private readonly classUserRepository: Model<ClassUserDocument>,
        @InjectModel(User.name) private readonly userRepository: Model<UserDocument>,
        @InjectModel(Class.name) private readonly classRepository: Model<ClassDocument>,
        @InjectModel(UserGrade.name) private readonly userGradeRepository: Model<UserGradeDocument>,
        @Inject(StorageService) private readonly storageService: StorageService,
    ) { }

    async checkIsHost(user: User, classId: Types.ObjectId): Promise<any> {
        const clazz = await this.classRepository.findOne({ _id: classId, host: user._id }).exec();
        if (!clazz) {
            return new HttpException('You are not the host of this class', HttpStatus.FORBIDDEN);
        }
    }

    private styleSheet(sheet) {
        sheet.getColumn(1).width = 30;
        sheet.getColumn(2).width = 20;
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        sheet.getRow(1).height = 30;
        sheet.getRow(1).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
    }

    private async checkInClass(user: User, classId: Types.ObjectId): Promise<any> {
        const classUser = await this.classUserRepository.findOne({ user_id: user._id, class_id: classId }).exec();
        if (classUser == null) {
            return new HttpException('You are not in this class', HttpStatus.FORBIDDEN);
        }
    }

    private async getStudentOfClass(classId: Types.ObjectId): Promise<User[]> {
        const classUser = await this.classUserRepository.find({ class_id: classId }).exec();
        if (classUser == null) {
            throw new HttpException('Class not found', HttpStatus.NOT_FOUND);
        }
        const studentids = classUser.map((classUser) => classUser.students.map((student) => student.user_id));
        const users = await this.userRepository.find({ _id: { $in: studentids } }).exec();
        return users;
    }

    private async isClassExist(classId: Types.ObjectId): Promise<any> {
        const clazz = await this.classRepository.findOne({ _id: classId }).exec();
        if (!clazz) {
            throw new HttpException('Class not found', HttpStatus.NOT_FOUND);
        }
    }

    async downloadListStudentTemplate(currentUser: User, classid: string) {
        const classId = new Types.ObjectId(classid);

        this.checkInClass(currentUser, classId);
        const users = await this.getStudentOfClass(classId);
        let rows = [];
        users.forEach(async (user) => {
            const classUser = await this.classUserRepository.findOne({ class_id: classId }).exec();
            const studentId = classUser.students.find((student) => student.user_id == user._id).student_id;
            rows.push(Object.values({ Name: user.fullname, Id: studentId }));
        });
        let book = new Workbook();
        let sheet = book.addWorksheet('List Student');
        rows.unshift(Object.values({ studentName: 'Student Name', studentId: 'Student Id' }));
        sheet.addRows(rows);
        this.styleSheet(sheet);

        let File = await new Promise((resolve, rejects) => {
            tmp.file(
                {
                    discardDescriptor: true,
                    prefix: `MyExcelSheet`,
                    postfix: '.xlsx',
                    mode: parseInt('0600', 8),
                },
                async (err, file) => {
                    if (err) throw new BadRequestException(err);
                    await book.xlsx.writeFile(file);
                    resolve(file);
                }
            );
        });

        return File;
    }

    async uploadListStudentCsv(currentUser: User, classid: string, file: Express.Multer.File) {
        const classId = new Types.ObjectId(classid);
        await this.isClassExist(classId);
        await this.checkIsHost(currentUser, classId);
        const fileName = await this.storageService.uploadCsv(file, classid);

        await this.classRepository.findOneAndUpdate(
            { _id: new Types.ObjectId(classId) },
            {
                list_student_url: `https://storageclassroom.blob.core.windows.net/upload-file/${fileName}`
            }, { new: true }).exec();

        return {
            message: 'Upload file successful',
            fileName: fileName
        };
    }

    async showStudentsListxGradesBoard(currentUser: User, classid: string) {
        const classId = new Types.ObjectId(classid);
        this.checkInClass(currentUser, classId);
        try {
            const users = await this.getStudentOfClass(classId);
            let rows = [];
            users.forEach(async (user) => {
                const userxgrade = await this.userGradeRepository.findOne({ user_id: user._id, class_id: classId }).exec();
                const classUser = await this.classUserRepository.findOne({ class_id: classId }).exec();
                const studentId = classUser.students.find((student) => student.user_id == user._id).student_id;
                rows.push(Object.values({ Name: user.fullname, Id: studentId, Grade: userxgrade.grades }));
            })

            return rows;
        }
        catch (err) {
            throw new HttpException('Error', HttpStatus.BAD_REQUEST);
        }
    }

    async inputGradeForStudent(currentUser: User, dto: InputGradeDto) {
        const classId = new Types.ObjectId(dto.class_id);
        const userId = new Types.ObjectId(dto.user_id);
        this.checkInClass(currentUser, classId);

        const user = await this.userRepository.findOne({ _id: userId }).exec();
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        const clazz = await this.classRepository.findOne({ _id: classId }).exec();
        if (!clazz) {
            throw new HttpException('Class not found', HttpStatus.NOT_FOUND);
        }
        const classUser = await this.classUserRepository.findOne({ class_id: classId }).exec();
        const check = classUser.students.find((student) => student.user_id == user._id);
        if (!check) {
            throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
        }
        const gradeCompo_name = this.userGradeRepository.findOne({ class_id: dto.class_id, user_id: dto.user_id, "class_grades.grades.gradeCompo_name": dto.gradeCompo_name }).exec();
        if (!gradeCompo_name) {
            throw new HttpException('Grade composition not found', HttpStatus.NOT_FOUND);
        }
        const grade = await this.userGradeRepository.findOneAndUpdate(
            { class_id: dto.class_id, user_id: dto.user_id, "class_grades.grades.gradeCompo_name": dto.gradeCompo_name },
            { $set: { "class_grades.$.grades.$.current_grade": dto.input_grade } },
            { new: true }
        ).exec();

        return {
            grade,
            message: 'Input grade successful'
        };
    }

    async downloadTemplateByAssignment(currentUser: User, classid: string, gradeCompo_name: string) {
        const classId = new Types.ObjectId(classid);
        this.checkInClass(currentUser, classId);
        const users = await this.getStudentOfClass(classId);
        let rows = [];
        users.forEach(async (user) => {
            const classUser = await this.classUserRepository.findOne({ class_id: classId }).exec();
            const studentId = classUser.students.find((student) => student.user_id == user._id).student_id;
            const gradeCompo = await this.userGradeRepository.findOne({ class_id: classId, user_id: user._id }).exec();
            const current_grade = gradeCompo.grades.find((grade) => grade.gradeCompo_name == gradeCompo_name).current_grade;
            rows.push(Object.values({ Name: user.fullname, Id: studentId, Grade: current_grade }));
        })

        let book = new Workbook();
        let sheet = book.addWorksheet('List Student with Assignment grade');
        rows.unshift(Object.values({ studentName: 'Student Name', studentId: 'Student Id', gradeCompo_name: gradeCompo_name }));
        sheet.addRows(rows);
        this.styleSheet(sheet);

        let File = await new Promise((resolve, rejects) => {
            tmp.file(
                {
                    discardDescriptor: true,
                    prefix: `StudentGrade${gradeCompo_name}`,
                    postfix: '.xlsx',
                    mode: parseInt('0600', 8),
                },
                async (err, file) => {
                    if (err) throw new BadRequestException(err);
                    await book.xlsx.writeFile(file);
                    resolve(file);
                }
            );
        });

        return File;
    }


    async exportGradeBoard(currentUser: User, classid: string, gradeCompo_name: string) {
        const classId = new Types.ObjectId(classid);
        this.checkInClass(currentUser, classId);
        const users = await this.getStudentOfClass(classId);
        let rows = [];
        users.forEach(async (user) => {
            const userxgrade = await this.userGradeRepository.findOne({ user_id: user._id, class_id: classId }).exec();
            const classUser = await this.classUserRepository.findOne({ class_id: classId }).exec();
            const studentId = classUser.students.find((student) => student.user_id == user._id).student_id;
            rows.push(Object.values({ Name: user.fullname, Id: studentId, Grade: userxgrade.grades.find((grade) => grade.gradeCompo_name == gradeCompo_name).current_grade }));
        })
        let book = new Workbook();
        let sheet = book.addWorksheet('List Student');
        let column = {};

        rows.unshift(Object.values({ studentName: 'Student Name', studentId: 'Student Id' }));
        sheet.addRows(rows);
    }

    async markGradeCompositionAsFinal(currentUser: User, gradeCompositionName: string, classid: string) {
        const classId = new Types.ObjectId(classid);
        this.checkInClass(currentUser, classId);

        const clazz = await this.classRepository.findOneAndUpdate(
            { _id: classId, "grade_compositions.gradeCompo_name": gradeCompositionName },
            { $set: { "grade_compositions.$.isFinal": true } },
            { new: true }
        ).exec();

        return clazz.grade_compositions;
    }

}