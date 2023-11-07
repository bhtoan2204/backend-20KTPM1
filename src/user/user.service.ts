import { HttpStatus, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "./entity/user.entity";
import { Repository } from 'typeorm';
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "./dto/createUser.dto";
import * as bcrypt from 'bcrypt';
import { RegistrationException } from "./exception/registration.exception";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto) {
        try {
            await this.validateCreateUser(createUserDto.email);

            const hashPassword = await bcrypt.hash(createUserDto.password, 10);
            const newUser = await this.userRepository.save({
                email: createUserDto.email,
                password: hashPassword,
                role: createUserDto.role,
                fullname: createUserDto.fullname,
                birthday: createUserDto.birthday,
            });

            return {
                user_info: {
                    user_id: newUser.id,
                    email: newUser.email
                },
                message: "User created successfully",
                http_code: HttpStatus.CREATED,
            };
        } catch (err) {
            throw new RegistrationException(err.message, err.http_code || 500, false);
        }
    }

    async validateCreateUser(email: string) {
        let checkEmailUser: User;
        try {
            checkEmailUser = await this.userRepository.findOne({ where: { email } });
        }
        catch (err) {
            throw new RegistrationException(err.message, err.http_code || 500, false);
        }
        if (checkEmailUser) {
            throw new RegistrationException("Email already exists", 400, false);
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
        return this.userRepository.findOne({ where: { id: entryId } });
    }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userRepository.findOne({ where: { email } });
        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            throw new UnauthorizedException('Credentials are not valid.');
        }
        else return user;
    }

    async getUserOrCreate(email: string): Promise<any> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            return { user: null, is_exist: false }
        }
        else return { user, is_exist: true };
    }
}