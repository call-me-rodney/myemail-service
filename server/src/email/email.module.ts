import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Email } from './email.model';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';


@Module({
  imports: [SequelizeModule.forFeature([Email])],
  providers: [EmailService],
  controllers: [EmailController],
})

export class EmailModule {}
