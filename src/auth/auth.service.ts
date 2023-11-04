import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { RefreshToken } from "./entity/refreshToken.entity";
import { TokenPayload } from "./interface/tokenPayload.interface";
import { User } from "src/user/entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Response } from "express"

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,

        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>
    ) { }

    async login(user: User, response: Response) {
        const { accessToken, refreshToken } = await this.getToken(user.id, user.role);
        try {
            try {
                const refreshTokenEntity = await this.refreshTokenRepository.findOne({ where: { user_id: user.id } });
                if (refreshTokenEntity != null) {
                    this.refreshTokenRepository.merge(refreshTokenEntity, { refresh_token: refreshToken });
                    await this.refreshTokenRepository.save(refreshTokenEntity);
                }
            } catch (e) {
                await this.refreshTokenRepository.create({
                    refresh_token: refreshToken,
                    user_id: user.id
                });
            }
            const expiresAT = new Date();
            const expiresRT = new Date();
            expiresAT.setSeconds(
                expiresAT.getSeconds() + this.configService.get('JWT_EXPIRATION'),
            );
            expiresRT.setSeconds(
                expiresRT.getSeconds() + this.configService.get('REFRESH_EXPIRATION'),
            );

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
                refreshToken
            }
        }
        catch (err) {
            throw new ConflictException(err)
        }
    }

    async getToken(userId: any, role: string) {
        const jwtPayload: TokenPayload = {
            id: userId, role
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(jwtPayload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: '15m'
            }),
            this.jwtService.signAsync(jwtPayload, {
                secret: this.configService.get<string>('JWT_SECRET_REFRESH'),
                expiresIn: '1d'
            })
        ])
        return { accessToken, refreshToken }
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
        this.refreshTokenRepository.delete({ user_id: user.id });
    }

    async refresh(user: User, response: Response) {
        const { accessToken, refreshToken } = await this.getToken(user.id, user.role);
        try {
            const refreshTokenEntity = await this.refreshTokenRepository.findOne({ where: { user_id: user.id } });
            if (refreshTokenEntity) {
                refreshTokenEntity.refresh_token = refreshToken;
                await this.refreshTokenRepository.save(refreshTokenEntity);
            }
        } catch (err) {
            if (err instanceof NotFoundException) {
                await this.refreshTokenRepository.delete({ user_id: user.id });
                throw new UnauthorizedException();
            } else {
                throw err;
            }
        }
        response.cookie('accessToken', accessToken, {
            httpOnly: true,
        });
        response.cookie('refreshToken', refreshToken, {
            httpOnly: true,
        });
        return { accessToken, refreshToken }
    }
}