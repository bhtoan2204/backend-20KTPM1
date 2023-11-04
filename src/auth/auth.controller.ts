import { Controller, Post, UseGuards, Req, Body, Res } from '@nestjs/common';
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorator/current-user.decorator';
import { User } from 'src/user/entity/user.entity';
import { Response } from "express"

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@CurrentUser() currentUser: User, @Res({ passthrough: true }) response: Response) {
        return await this.authService.login(currentUser, response);
    }

    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    async refresh(@CurrentUser() currentUser: User, @Res({ passthrough: true }) response: Response) {
        return this.authService.refresh(currentUser, response);
    }

    @UseGuards(JwtRefreshGuard)
    @Post('logout')
    async logout(@Req() request, @Res({ passthrough: true }) response: Response) {
        const user = request.user;
        return this.authService.logout(user, response);
    }
}
