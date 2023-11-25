import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Workbook } from "exceljs";
import * as tmp from 'tmp';
import { User } from "../schema/user.schema";
import { ClassUser } from "../schema/classUser.schema";
import { GradeComposition } from "../schema/gradeComposition.schema";

@Injectable()
export class GradeManagementService {
    constructor(
        @InjectModel(GradeComposition.name) private readonly gradeCompositionRepository,
        @InjectModel(ClassUser.name) private readonly classUserRepository,
        @InjectModel(User.name) private readonly userRepository,
    ) { }

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
        const classUser = await this.classUserRepository.findOne({ user_id: user._id, class_id: classId }).exec();
        if (classUser == null) {
            return new HttpException('You are not in this class', HttpStatus.FORBIDDEN);
        }
    }

    private async getStudentOfClass(classId: string): Promise<User[]> {
        const classUser = await this.classUserRepository.find({ class_id: classId }).exec();
        if (classUser == null) {
            throw new HttpException('Class not found', HttpStatus.NOT_FOUND);
        }
        const users = await this.userRepository.find({ _id: { $in: classUser.map((user) => user.user_id) } }).exec();

        return users;
    }

    private async isClassExist(classId: string): Promise<any> {
        const classUser = await this.classUserRepository.findOne({ class_id: classId }).exec();
        if (classUser == null) {
            throw new HttpException('Class not found', HttpStatus.NOT_FOUND);
        }
    }

    async downloadListStudentCsv(currentUser: User, classId: string) {
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

        return File;
    }

}