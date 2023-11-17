import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { RegistrationException } from './exception/registration.exception';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { MailService } from 'src/mail/mail.service';
import { generate } from 'rxjs';
import { generateRandomPassword } from 'src/utils/generator/password.generator';
import { ChangePassworDto } from './dto/changePassword.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userRepository: Model<UserDocument>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      await this.validateCreateUser(createUserDto.email);
      const hashPassword = await bcrypt.hash(createUserDto.password, 10);

      const newUser = new this.userRepository({
        email: createUserDto.email,
        password: hashPassword,
        role: createUserDto.role,
        fullname: createUserDto.fullname,
        birthday: new Date(),
      });

      await newUser.save();

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
      checkEmailUser = await this.userRepository.findOne({ email }).exec();
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
      throw new Error(`Error finding ${err} user ${err.message}`);
    }
  }

  async getUserById(entryId: string) {
    return await this.userRepository.findOne({ _id: entryId })
      .select('-password')
      .select('-refreshToken')
      .select('-createAt')
      .select('-updatedAt')
      .select('-__v')
      .select('-id')
      .exec();
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ email }).exec();
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

  async checkExist(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ email }).exec();
    if (user) return true;
    else return false;
  }

  async editProfile(_id: string, dto: any): Promise<any> {
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
    catch (err) { throw err; }
  }

  async updateRefresh(id: string, refreshToken: string): Promise<any> {
    try {
      await this.userRepository.findOneAndUpdate({ id }, { refreshToken }, { new: true }).exec();
    }
    catch (err) { throw err; }
  }

  async softDeleteRefresh(id: string): Promise<any> {
    try {
      await this.userRepository.findOneAndUpdate({ id }, { refreshToken: null }, { new: true }).exec();
    }
    catch (err) { throw err; }
  }

  async validateGoogleUser(details: any) {
    const user = await this.userRepository.findOne({ email: details._json.email }).exec();
    if (user) return user;
    else {
      const newUser = new this.userRepository({
        email: details._json.email,
        password: generateRandomPassword(60),
        role: 'user',
        fullname: details._json.family_name + ' ' + details._json.given_name,
        avatar: details._json.picture,
        birthday: new Date(),
      });
      return await newUser.save();
    }
  }

  async findUserById(id: string): Promise<User> {
    return await this.userRepository.findOne({ _id: id }).exec();
  }

  async changePassword(id: string, dto: ChangePassworDto): Promise<any> {
    if (dto.password !== dto.rewrite_password) {
      throw new Error('New password must be different from old password');
    }
    else {
      const hashPassword = await bcrypt.hash(dto.password, 10);
      await this.userRepository.findOneAndUpdate(
        { _id: id },
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
}
