import { Body, Controller, Post, Get, UseGuards, Req, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/createUser.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TokenPayload } from '../auth/interface/tokenPayload.interface';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { User } from './entity/user.entity';
import { EditProfileDTO } from './dto/editProfile.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly usersService: UserService) { }

  @Post('/signup')
  @ApiOperation({ summary: 'Sign up' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('/profile')
  @ApiOperation({ summary: 'Get user profile' })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() request) {
    const { id } = request.user as TokenPayload;
    return this.usersService.getUserById(id);
  }

  @Post('/send-otp')
  @ApiOperation({ summary: 'Send OTP to email' })
  async sendOtp(@Body() body: { email: string }) { }

  @Patch('/edit_profile')
  @UseGuards(JwtAuthGuard)
  async editProfile(@CurrentUser() user: User, @Body() dto: EditProfileDTO, @Body() body: { name: string }) {
    const { id } = user;
    return this.usersService.editProfile(id, dto);
  }
}
