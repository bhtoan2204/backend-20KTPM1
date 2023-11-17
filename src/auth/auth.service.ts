import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interface/tokenPayload.interface';
import { User } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { Otp, OtpDocument } from './schema/otp.schema';
import { Model } from 'mongoose';
import { MailService } from 'src/mail/mail.service';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectModel(Otp.name)
    private otpRepository: Model<OtpDocument>,
    @Inject(MailService)
    private readonly mailService: MailService,

  ) { }

  async login(user: User) {
    const { accessToken, refreshToken } = await this.getToken(user._id, user.role);

    try {
      this.userService.updateRefresh(user._id, refreshToken);

      return {
        accessToken,
        refreshToken,
      };
    } catch (err) {
      throw new ConflictException(err);
    }
  }

  async getToken(userId: any, role: string) {
    const jwtPayload: TokenPayload = {
      _id: userId,
      role,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_SECRET_REFRESH'),
        expiresIn: '1d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  async logout(user: any) {
    this.userService.softDeleteRefresh(user._id);
  }

  async refresh(user: User) {
    const { accessToken, refreshToken } = await this.getToken(user._id, user.role);
    try {
      await this.userService.updateRefresh(user._id, refreshToken);
    } catch (err) {
      if (err instanceof NotFoundException) {
        await this.userService.softDeleteRefresh(user._id);
        throw new UnauthorizedException();
      } else {
        throw err;
      }
    };

    return {
      accessToken,
      refreshToken,
    };
  }

  googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    return {
      message: 'User information from google',
      user: req.user,
    };
  }

  async sendOTP(email: string) {
    try {
      const isExist = await this.userService.checkExist(email);
      if (!isExist) return { message: "Email not found" };

      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpRecord = await this.otpRepository.findOne({ email }).exec();
      if (otpRecord) {
        otpRecord.otp = otp;
        otpRecord.save();
      }
      else {
        const newOtp = new this.otpRepository({
          email,
          otp,
        });
        await newOtp.save();
      }
      await this.mailService.sendOtp(email, otp);
      return { message: "OTP sent" };
    }
    catch (err) {
      throw new ConflictException(err);
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const otpRecord = await this.otpRepository.findOne({ email: dto.email }).exec();
    if (otpRecord.otp !== dto.otp) throw new ConflictException("OTP not match");
    if (dto.password !== dto.rewrite_password) throw new ConflictException("Password and confirm password not match");

    try {
      await this.userService.updatePassword(dto.email, dto.password);
      await this.otpRepository.deleteOne({ email: dto.email }).exec();
      return { message: "Reset password successfully" };
    }
    catch (err) {
      throw new ConflictException(err);
    }
  }
}
