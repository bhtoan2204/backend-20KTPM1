import { ConflictException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, MongooseError } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { ChangePassworDto } from './dto/changePassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { LoginType } from 'src/utils/enum/loginType.enum';
import { User, UserDocument } from 'src/utils/schema/user.schema';
import { RegisterOtp, RegisterOtpDocument } from 'src/utils/schema/registerOtp.schema';
import { ResetOtp, ResetOtpDocument } from 'src/utils/schema/resetOtp.schema';
import { SearchService } from 'src/elastic/search.service';
import { Role } from 'src/utils/enum/role.enum';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<UserDocument>,
    @InjectModel(RegisterOtp.name) private registerOtpRepository: Model<RegisterOtpDocument>,
    @InjectModel(ResetOtp.name) private resetOtpRepository: Model<ResetOtpDocument>,
    @Inject(MailService) private readonly mailService: MailService,
    @Inject(SearchService) private readonly searchService: SearchService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      await this.validateCreateUser(createUserDto.email);
      const otpRecord = await this.registerOtpRepository.findOne({ email: createUserDto.email }).exec();

      if (!otpRecord) throw new Error("OTP not found");
      if (otpRecord.otp !== createUserDto.otp) throw new Error("OTP not match");

      const hashPassword = await bcrypt.hash(createUserDto.password, 10);

      const newUser = new this.userRepository({
        email: createUserDto.email,
        password: hashPassword,
        role: 'null',
        fullname: createUserDto.fullname,
        birthday: new Date(),
        login_type: LoginType.LOCAL,
      });

      await newUser.save();
      await this.searchService.indexUser(newUser);
      await this.registerOtpRepository.deleteOne({ email: createUserDto.email }).exec();

      return {
        user_info: {
          user_id: newUser._id,
          email: newUser.email,
        },
        message: 'User created successfully',
        http_code: HttpStatus.CREATED,
      };
    } catch (err) {
      throw new Error(err.message, err.http_code || 500);
    }
  }

  async validateCreateUser(email: string) {
    let checkEmailUser: User;
    try {
      checkEmailUser = await this.userRepository.findOne({ email, login_type: 'local' }).exec();
    } catch (err) {
      throw new MongooseError(err);
    }
    if (checkEmailUser) {
      throw new MongooseError('Email already exists');
    }
  }

  async getUserById(entryId: any) {
    return await this.userRepository.findOne({ _id: entryId })
      .select('-password')
      .select('-refreshToken')
      .select('-createAt')
      .select('-updatedAt')
      .select('-__v')
      .select('-id')
      .exec();
  }

  async validateLocalUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ email, login_type: 'local' }).exec();
    if (!user) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
    if (user.is_ban === true) {
      throw new UnauthorizedException('Your account has been banned.');
    }
    else {
      return user;
    };
  }

  async checkExistForReset(email: string): Promise<any> {
    const user = await this.userRepository.findOne({ email }).exec();
    if (!user) throw new HttpException('Email Not Found', HttpStatus.NOT_FOUND);
  }

  async checkExistLocal(email): Promise<any> {
    const user = await this.userRepository.findOne({ email, login_type: 'local' }).exec();
    if (user) throw new HttpException('This Email is already created', HttpStatus.CONFLICT);
  }


  async editProfile(_id: any, dto: any): Promise<any> {
    try {
      const user = await this.userRepository.findOneAndUpdate(
        { _id },
        {
          fullname: dto.fullname,
          birthday: dto.birthday
        },
      ).exec();

      user.fullname = dto.fullname;
      user.birthday = dto.birthday;

      await this.searchService.update(user);

      return { message: "Update profile successfully" }
    }
    catch (err) {
      throw err;
    }
  }

  async uploadAvatar(_id: any, fileName: string): Promise<any> {
    try {
      await this.userRepository.findOneAndUpdate({ _id }, {
        avatar: `https://storageclassroom.blob.core.windows.net/upload-file/${fileName}`,
      }, { new: true }).exec();

      return {
        message: "Upload avatar successfully",
        avatar: `https://storageclassroom.blob.core.windows.net/upload-file/${fileName}`
      };
    }
    catch (err) {
      throw err;
    }
  }

  async updateRefresh(_id: any, refreshToken: string): Promise<any> {
    try {
      await this.userRepository.findOneAndUpdate({ _id }, { refreshToken }, { new: true }).exec();
    }
    catch (err) { throw err; }
  }

  async softDeleteRefresh(_id: any): Promise<any> {
    try {
      await this.userRepository.findOneAndUpdate({ _id }, { refreshToken: null }, { new: true }).exec();
    }
    catch (err) { throw err; }
  }

  async validateGoogleUser(details: any) {
    const user = await this.userRepository.findOne({
      email: details._json.email,
      login_type: LoginType.GOOGLE
    }).exec();

    if (user) {
      if (user.is_ban === true) {
        throw new UnauthorizedException('Your account has been banned.');
      }
      return user;
    }
    else {

      const newUser = new this.userRepository({
        email: details._json.email,
        password: crypto.randomBytes(Math.ceil(20 / 2)).toString('hex').slice(0, 20),
        role: 'null',
        fullname: details._json.family_name + ' ' + details._json.given_name,
        avatar: details._json.picture,
        birthday: new Date(),
        login_type: LoginType.GOOGLE,
      });
      await this.searchService.indexUser(newUser);
      return await newUser.save();
    }
  }

  async validateFacebookUser(details: any) {
    const user = await this.userRepository.findOne({
      email: details._json.email,
      login_type: LoginType.FACEBOOK
    }).exec();

    if (user) {
      if (user.is_ban === true) {
        throw new UnauthorizedException('Your account has been banned.');
      }
      return user;
    }
    else {
      const newUser = new this.userRepository({
        email: details._json.email,
        password: crypto.randomBytes(Math.ceil(20 / 2)).toString('hex').slice(0, 20),
        role: 'null',
        fullname: details._json.first_name + ' ' + details._json.last_name,
        avatar: `https://graph.facebook.com/${details._json.id}/picture?type=large`,
        birthday: new Date(),
        login_type: LoginType.FACEBOOK,
      });
      await this.searchService.indexUser(newUser);
      return await newUser.save();
    }
  }

  async findUserById(_id: any): Promise<User> {
    return await this.userRepository.findOne({ _id }).exec();
  }

  async updatePassword(_id: any, dto: ChangePassworDto) {
    if (dto.password !== dto.rewrite_password) {
      throw new Error('Two password are not match');
    }
    const hashPassword = await bcrypt.hash(dto.password, 10);
    await this.userRepository.findOneAndUpdate(
      { _id },
      {
        password: hashPassword,
      },
    ).exec();

    return { message: "Update password successfully" };
  }

  async sendRegisterOTP(email: string) {
    try {
      await this.checkExistLocal(email);
      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpRecord = await this.registerOtpRepository.findOne({ email }).exec();
      if (otpRecord) {
        otpRecord.otp = otp;
        await otpRecord.save();
      }
      else {
        const newOtp = new this.registerOtpRepository({
          email,
          otp,
        });
        await newOtp.save();
      }
      const title = "Register your account";
      await this.mailService.sendOtp(email, otp, title);
      return { message: "OTP sent" };
    }
    catch (err) {
      throw new ConflictException(err);
    }
  }

  async sendResetOTP(email: string) {
    try {
      await this.checkExistForReset(email);

      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpRecord = await this.resetOtpRepository.findOne({ email }).exec();
      if (otpRecord) {
        otpRecord.otp = otp;
        await otpRecord.save();
      }
      else {
        const newOtp = new this.resetOtpRepository({
          email,
          otp,
        });
        await newOtp.save();
      }
      const title = "Reset your password";
      await this.mailService.sendOtp(email, otp, title);
      return { message: "OTP sent" };
    }
    catch (err) {
      throw new ConflictException(err);
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const otpRecord = await this.resetOtpRepository.findOne({ email: dto.email }).exec();
    if (otpRecord.otp !== dto.otp) throw new ConflictException("OTP not match");
    if (dto.password !== dto.rewrite_password) throw new ConflictException("Password and confirm password not match");

    try {
      await this.userRepository.findOneAndUpdate(
        { email: dto.email, login_type: LoginType.LOCAL },
        { password: await bcrypt.hash(dto.password, 10) }).exec();

      await this.resetOtpRepository.deleteOne({ email: dto.email }).exec();
      return { message: "Reset password successfully" };
    }
    catch (err) {
      throw new ConflictException({ err, status: HttpStatus.CONFLICT });
    }
  }

  async assignRole(user: User, role: string) {
    try {
      if (user.role !== 'null') throw new ConflictException("User already has role");
      const updatedUser = await this.userRepository.findOneAndUpdate({ _id: user._id }, { role }).exec();
      await this.searchService.update(updatedUser);
      return { message: "Assign role successfully" };
    }
    catch (err) {
      throw new ConflictException(err);
    }
  }
}
