import { Controller, Post, UseGuards, Req, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorator/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/schema/user.schema';
import { Public } from './guards/public.guard';

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

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@CurrentUser() currentUser: User) {
    return this.authService.refresh(currentUser);
  }

}
