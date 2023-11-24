import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './service/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schema/user.schema';
import { RegisterOtpSchema } from './schema/registerOtp.schema';
import { MailModule } from '../mail/mail.module';
import { StorageService } from './service/storage.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'RegisterOtp', schema: RegisterOtpSchema }]),
    MailModule,
  ],
  controllers: [UserController],
  providers: [UserService, StorageService],
  exports: [UserService, StorageService],
})
export class UserModule { }
