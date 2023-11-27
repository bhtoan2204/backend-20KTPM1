import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Workbook } from "exceljs";
import { Model, Types } from "mongoose";
import * as tmp from 'tmp';
import { StorageService } from "src/storage/storage.service";
import { ClassUser, ClassUserDocument } from "src/utils/schema/classUser.schema";
import { User, UserDocument } from "src/utils/schema/user.schema";
import { Class, ClassDocument } from "src/utils/schema/class.schema";

@Injectable()
export class GradeManagementService {
    constructor(
        @InjectModel(ClassUser.name) private readonly classUserRepository: Model<ClassUserDocument>,
        @InjectModel(User.name) private readonly userRepository: Model<UserDocument>,
        @InjectModel(Class.name) private readonly classRepository: Model<ClassDocument>,
        @Inject(StorageService) private readonly storageService: StorageService,
    ) { }

    async checkIsHost(user: User, classId: string): Promise<any> {
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

    private async checkInClass(user: User, classId: string): Promise<any> {
        const classUser = await this.classUserRepository.findOne({ user_id: user._id, class_id: new Types.ObjectId(classId) }).exec();
        if (classUser == null) {
            return new HttpException('You are not in this class', HttpStatus.FORBIDDEN);
        }
    }

    private async getStudentOfClass(classId: string): Promise<User[]> {
        const classUser = await this.classUserRepository.find({ class_id: classId }).exec();
        if (classUser == null) {
            throw new HttpException('Class not found', HttpStatus.NOT_FOUND);
        }
        const studentids = classUser.map((classUser) => classUser.students.map((student) => student.user_id));
        const users = await this.userRepository.find({ _id: { $in: studentids } }).exec();
        return users;
    }

    private async isClassExist(classId: string): Promise<any> {
        const clazz = await this.classRepository.findOne({ _id: classId }).exec();
        if (!clazz) {
            throw new HttpException('Class not found', HttpStatus.NOT_FOUND);
        }
    }

    async downloadListStudentTemplate(currentUser: User, classId: string) {
        this.checkInClass(currentUser, classId);

        const users = await this.getStudentOfClass(classId);
        let rows = [];
        users.forEach((user) => {
            rows.push(Object.values({ Name: user.fullname, Id: user._id.toString() }));
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

    async uploadListStudentCsv(currentUser: User, classId: string) {
        this.isClassExist(classId);
        this.checkIsHost(currentUser, classId);

        this.isClassExist(classId);
        this.checkInClass(currentUser, classId);
        const users = await this.getStudentOfClass(classId);

        let rows = [];
        users.forEach((user) => {
            rows.push(Object.values({ Name: user.fullname, Id: user._id }));
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

    }

    async showStudentsListxGradesBoard(currentUser: User, classId: string) {

    }

    async exportGradeBoard(currentUser: User, classId: string) {

    }

    async markGradeCompositionAsFinal(currentUser: User, gradeCompositionName: string, classId: string) {
        this.checkInClass(currentUser, classId);

        const clazz = await this.classRepository.findOneAndUpdate(
            { _id: classId, "grade_compositions.gradeCompo_name": gradeCompositionName },
            { $set: { "grade_compositions.$.isFinal": true } },
            { new: true }
        ).exec();

        return clazz.grade_compositions;
    }

}