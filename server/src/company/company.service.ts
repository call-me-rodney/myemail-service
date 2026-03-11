import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from './models/company.model';

@Injectable()
export class CompanyService {
  constructor(@InjectModel(Company) private companyModel: typeof Company){}
  async create(createCompanyDto: CreateCompanyDto): Promise<string | Company> {
    const newCompany = await this.companyModel.create({createCompanyDto});

    if (!newCompany) {
      throw new Error("Error creating new company")
    }

    const company = newCompany.toJSON();

    return company;
  }

  async findAll(): Promise<string | Company[]> {
    const companyObjs = await this.companyModel.findAll();

    if (!companyObjs) {
      throw new NotFoundException("No company's available")
    }

    return companyObjs.map(co => co.toJSON());
  }

  async findOne(id: string):Promise<string> {
    const companyObj = await this.companyModel.findByPk(id);

    if (!companyObj){
      throw new NotFoundException("Company not found!");
    }

    return companyObj.toJSON();
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto):Promise<string> {
    const companyObj = await this.companyModel.findByPk(id);

    if (!companyObj) {
      throw new NotFoundException("Company not found!")
    }

    await companyObj.update(updateCompanyDto);
    const company = companyObj.toJSON();

    return `Company with id: ${company.id} has been updated.`;
  }

  async remove(id: string):Promise<string> {
    const companyObj = await this.companyModel.findByPk(id);

    if (!companyObj){
      throw new NotFoundException("Company not found!");
    }
    await companyObj.destroy();
    return `Company with id: ${id} has been deleted!`;
  }
}
