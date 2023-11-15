import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interface/tokenPayload.interface';
import { Response } from 'express';
import { User } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService

  ) { }

  async login(user: User, response: Response) {
    const { accessToken, refreshToken } = await this.getToken(user._id, user.role);

    try {
      this.userService.updateRefresh(user._id, refreshToken);

      const expiresAT = new Date();
      expiresAT.setSeconds(expiresAT.getSeconds() + this.configService.get('JWT_EXPIRATION'));

      const expiresRT = new Date();
      expiresRT.setSeconds(expiresRT.getSeconds() + this.configService.get('REFRESH_EXPIRATION'));

      response.cookie('accessToken', accessToken, {
        httpOnly: true,
        expires: expiresAT,
      });
      response.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        expires: expiresRT,
      });

      return {
        accessToken,
        refreshToken,
        expiresAT,
        expiresRT
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

  async logout(user: any, response: Response) {
    response.cookie('accessToken', '', {
      httpOnly: true,
      expires: new Date(),
    });
    response.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(),
    });
    this.userService.softDeleteRefresh(user._id);
  }

  async refresh(user: User, response: Response) {
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

    const expiresAT = new Date();
    expiresAT.setSeconds(expiresAT.getSeconds() + this.configService.get('JWT_EXPIRATION'));

    const expiresRT = new Date();
    expiresRT.setSeconds(expiresRT.getSeconds() + this.configService.get('REFRESH_EXPIRATION'));

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      expires: expiresAT,
    });
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      expires: expiresRT,
    });
    return {
      accessToken,
      refreshToken,
      expiresAT,
      expiresRT
    };
  }
}
