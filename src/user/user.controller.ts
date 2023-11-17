import { Body, Controller, Post, Get, UseGuards, Req, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/createUser.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TokenPayload } from '../auth/interface/tokenPayload.interface';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { EditProfileDTO } from './dto/editProfile.dto';
import { User } from './schema/user.schema';
import { ChangePassworDto } from './dto/changePassword.dto';
import { sendOTPDto } from 'src/auth/dto/sendOTP.dto';

@ApiTags('user')
@Controller('user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly usersService: UserService) { }

  @HttpCode(HttpStatus.CREATED)
  @Post('/signup')
  @ApiOperation({ summary: 'Sign up' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/profile')
  @ApiOperation({ summary: 'Get user profile' })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() request) {
    const { _id } = request.user as TokenPayload;
    return this.usersService.getUserById(_id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Patch('/edit_profile')
  @UseGuards(JwtAuthGuard)
  async editProfile(@CurrentUser() user: User, @Body() dto: EditProfileDTO, @Body() body: { name: string }) {
    const { _id } = user;
    return this.usersService.editProfile(_id, dto);
  }

  @Patch('/change_password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@CurrentUser() user: User, @Body() dto: ChangePassworDto) {
    const { _id } = user;
    return this.usersService.changePassword(_id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/send_registerOtp')
  async sendRegisterOTP(@Body() dto: sendOTPDto) {
    return this.usersService.sendRegisterOTP(dto.email);
  }
}
