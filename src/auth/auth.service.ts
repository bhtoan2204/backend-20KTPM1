import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interface/tokenPayload.interface';
import { UserService } from '../user/user.service';
import { User } from 'src/utils/schema/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
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
        expiresIn: '60m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_SECRET_REFRESH'),
        expiresIn: '1d',
      }),
    ]);
    return { accessToken, refreshToken };
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

}
