import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SmsService } from 'src/common/sms/sms.service';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  exports: [UsersService, SequelizeModule],
  controllers: [UsersController],
  providers: [UsersService, SmsService],
})
export class UsersModule {}
