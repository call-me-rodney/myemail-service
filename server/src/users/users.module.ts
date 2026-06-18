import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailNotificationService } from 'src/common/providers/emailNotification.service';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  exports: [UsersService, SequelizeModule],
  controllers: [UsersController],
  providers: [UsersService, EmailNotificationService],
})
export class UsersModule {}
