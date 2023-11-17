import { Controller, Post, UseGuards, Req, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorator/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/schema/user.schema';
import { Public } from './guards/public.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { sendOTPDto } from './dto/sendOTP.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@ApiTags('auth')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
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
  googleAuthRedirect(@CurrentUser() currentUser: User) {
    return this.authService.login(currentUser);
  }

  @HttpCode(HttpStatus.CREATED)
  @Public()
  @Post('send_resetOtp')
  async sendOTP(@Body() dto: sendOTPDto) {
    return this.authService.sendOTP(dto.email);
  }

  @HttpCode(HttpStatus.CREATED)
  @Public()
  @Post('reset_password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
