import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { Company } from './models/company.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([Company])],
  exports: [SequelizeModule],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
