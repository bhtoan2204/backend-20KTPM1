import { Body, Controller, Post, Get, UseGuards, Req, Patch, HttpCode, HttpStatus, UseInterceptors, UploadedFile, Header, Res, Query } from '@nestjs/common';
import { UserService } from './service/user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/createUser.dto';
import { JwtAuthGuard } from '../auth/guards/AuthGuard/jwt-auth.guard';
import { TokenPayload } from '../auth/interface/tokenPayload.interface';
import { CurrentUser } from '../utils/decorator/current-user.decorator';
import { EditProfileDTO } from './dto/editProfile.dto';
import { ChangePassworDto } from './dto/changePassword.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './service/storage.service';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { sendOTPDto } from './dto/sendOtp.dto';
import { RoleDto } from './dto/role.dto';
import { User } from 'src/utils/schema/user.schema';

@ApiTags('user')
@Controller('user')
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly usersService: UserService,
    private readonly storageService: StorageService
  ) { }

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
  @UseInterceptors(CacheInterceptor)
  async getProfile(@Req() request) {
    const { _id } = request.user as TokenPayload;
    return (await this.usersService.getUserById(_id)).toJSON();
  }

  @HttpCode(HttpStatus.CREATED)
  @Patch('/edit_profile')
  @UseGuards(JwtAuthGuard)
  async editProfile(@CurrentUser() user: User, @Body() dto: EditProfileDTO, @Body() body: { name: string }) {
    const { _id } = user;
    return this.usersService.editProfile(_id, dto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Patch('/upload_avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
    const { _id } = user;
    const fileName = await this.storageService.uploadImage(file);
    return this.usersService.uploadAvatar(_id, fileName);
  }

  @Get('/get_avatar')
  @Header('Content-Type', 'image/webp')
  async readImage(@Res() res, @Query('filename') filename) {
    const data = await this.storageService.readStream(filename);
    return data.pipe(res);
  }

  @Patch('/change_password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@CurrentUser() user: User, @Body() dto: ChangePassworDto) {
    const { _id } = user;
    return this.usersService.updatePassword(_id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/send_registerOtp')
  async sendRegisterOTP(@Body() dto: sendOTPDto) {
    return this.usersService.sendRegisterOTP(dto.email);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('send_resetOtp')
  async sendOTP(@Body() dto: sendOTPDto) {
    return this.usersService.sendResetOTP(dto.email);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('reset_password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/assign-role')
  @UseGuards(JwtAuthGuard)
  async assignRole(@CurrentUser() user: User, @Body() dto: RoleDto) {
    return this.usersService.assignRole(user, dto.role);
  }
}
