import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Email } from './models/email.model';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

@Module({
  imports: [SequelizeModule.forFeature([Email])],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
