import { ConflictException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { RegistrationException } from '../exception/registration.exception';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { Model } from 'mongoose';
import { MailService } from '../../mail/mail.service';
import { ChangePassworDto } from '../dto/changePassword.dto';
import { RegisterOtp, RegisterOtpDocument } from '../schema/registerOtp.schema';
import { ResetOtp, ResetOtpDocument } from '../schema/resetOtp.schema';
import { ResetPasswordDto } from '../dto/resetPassword.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userRepository: Model<UserDocument>,
    @InjectModel(RegisterOtp.name)
    private registerOtpRepository: Model<RegisterOtpDocument>,
    @InjectModel(ResetOtp.name)
    private resetOtpRepository: Model<ResetOtpDocument>,
    @Inject(MailService)
    private readonly mailService: MailService,
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
        login_type: 'local',
      });

      await newUser.save();
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
      throw new RegistrationException(err.message, err.http_code || 500, false);
    }
  }

  async validateCreateUser(email: string) {
    let checkEmailUser: User;
    try {
      checkEmailUser = await this.userRepository.findOne({ email, login_type: 'local' }).exec();
    } catch (err) {
      throw new RegistrationException(err.message, err.http_code || 500, false);
    }
    if (checkEmailUser) {
      throw new RegistrationException('Email already exists', 400, false);
    }
  }

  async findOne(email: string, password: string): Promise<User | undefined> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });
      const isMatch = await bcrypt.compare(password, user.password);
      if (user && isMatch) {
        return user;
      } else {
        throw new Error(`User not found`);
      }
    } catch (err) {
      throw new NotFoundException(err.message);
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
    } else {
      return user;
    };
  }

  async checkExist(email: string): Promise<any> {
    const user = await this.userRepository.findOne({ email }).exec();
    if (user) throw new HttpException('This Email is already created', HttpStatus.CONFLICT);
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
      login_type: 'google'
    }).exec();

    if (user)
      return user;
    else {
      const newUser = new this.userRepository({
        email: details._json.email,
        password: '',
        role: 'null',
        fullname: details._json.family_name + ' ' + details._json.given_name,
        avatar: details._json.picture,
        birthday: new Date(),
        login_type: 'google',
      });
      return await newUser.save();
    }
  }

  async validateFacebookUser(details: any) {
    const user = await this.userRepository.findOne({
      email: details._json.email,
      login_type: 'facebook'
    }).exec();

    if (user) return user;
    else {
      const newUser = new this.userRepository({
        email: details._json.email,
        password: '',
        role: 'null',
        fullname: details._json.first_name + ' ' + details._json.last_name,
        avatar: `https://graph.facebook.com/${details._json.id}/picture?type=large`,
        birthday: new Date(),
        login_type: 'facebook',
      });
      return await newUser.save();
    }
  }

  async findUserById(_id: any): Promise<User> {
    return await this.userRepository.findOne({ _id }).exec();
  }

  async changePassword(_id: any, dto: ChangePassworDto): Promise<any> {
    if (dto.password !== dto.rewrite_password) {
      throw new Error('New password must be different from old password');
    }
    else {
      const hashPassword = await bcrypt.hash(dto.password, 10);
      await this.userRepository.findOneAndUpdate(
        { _id },
        {
          password: hashPassword,
        },
      ).exec();
      return {
        message: "Change password successfully"
      }
    }
  }

  async updatePassword(email: string, password: string) {
    const hashPassword = await bcrypt.hash(password, 10);
    await this.userRepository.findOneAndUpdate(
      { email },
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
        otpRecord.save();
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

  async getUsersByIds(userIds: any): Promise<User[]> {
    return await this.userRepository.find({ _id: { $in: userIds } });
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async sendResetOTP(email: string) {
    try {
      const isExist = await this.checkExist(email);
      if (!isExist) return { message: "Email not found" };

      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpRecord = await this.resetOtpRepository.findOne({ email }).exec();
      if (otpRecord) {
        otpRecord.otp = otp;
        otpRecord.save();
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
      await this.updatePassword(dto.email, dto.password);
      await this.resetOtpRepository.deleteOne({ email: dto.email }).exec();
      return { message: "Reset password successfully" };
    }
    catch (err) {
      throw new ConflictException({ err, status: HttpStatus.CONFLICT });
    }
  }
}
