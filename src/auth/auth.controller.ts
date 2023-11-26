import { Controller, Post, UseGuards, Req, Body, HttpCode, HttpStatus, Get, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/AuthGuard/local-auth.guard';
import { JwtRefreshGuard } from './guards/AuthGuard/jwt-refresh.guard';
import { CurrentUser } from '../utils/decorator/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { Public } from './guards/AuthGuard/public.guard';
import { GoogleAuthGuard } from './guards/AuthGuard/google-auth.guard';
import { FacebookAuthGuard } from './guards/AuthGuard/facebook-auth.guard';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/utils/schema/user.schema';

@ApiTags('auth')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) { }

  @HttpCode(HttpStatus.OK)
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('local/login')
  async login(
    @Body() dto: LoginDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.authService.login(currentUser);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@CurrentUser() currentUser: User) {
    return this.authService.refresh(currentUser);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {
    return { message: "google login successfully" }
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@CurrentUser() currentUser: User, @Res() res): Promise<any> {
    const { accessToken, refreshToken } = await this.authService.login(currentUser);
    return res.redirect(`${this.configService.get<string>('FRONTEND_URL')}/auth/google/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Get('facebook/login')
  @UseGuards(FacebookAuthGuard)
  async facebookAuth(@Req() req) {
    return { message: "facebook login successfully" }
  }

  @Get("facebook/callback")
  @UseGuards(FacebookAuthGuard)
  async facebookLoginRedirect(@CurrentUser() currentUser: User, @Res() res): Promise<any> {
    const { accessToken, refreshToken } = await this.authService.login(currentUser);
    return res.redirect(`${this.configService.get<string>('FRONTEND_URL')}/auth/google/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  }
}
