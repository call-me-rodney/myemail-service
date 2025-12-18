import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Email } from './models/email.model';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';

@Injectable()
export class EmailService {
  constructor(@InjectModel(Email) private emailModel: typeof Email) {}

  // create new email record
  async create(createEmailDto: CreateEmailDto): Promise<Email> {
    return this.emailModel.create(createEmailDto as any);
  }

  // fetch all records for the admin
  async findAll(): Promise<Email[]> {
    return this.emailModel.findAll();
  }

  // Fetch multiple emails for a specific user
  async findMultiple(user_id: string): Promise<Email[]> {
    return this.emailModel.findAll({
      where: {
        user_id,
      },
    });
  }  

  //fetch a single email record for a client
  async findOne(id: string): Promise<Email> {
    const email = await this.emailModel.findOne({
      where: {
        id,
      },
    });
    if (!email) {
      throw new Error('Email not found');
    }
    return email;
  }

  //update single email record or client
  async update(id: string, updateEmailDto: UpdateEmailDto): Promise<Email> {
    const email = await this.emailModel.findOne({
      where: {
        id,
      },
    });
    if (email) {
      await email.update(updateEmailDto as any);
      return email;
    }
    throw new Error('Email not found');
  }

  //delete single email record for client
  async remove(id: string): Promise<string> {
    const email = await this.emailModel.findOne({
      where: {
        id,
      },
    });
    if (email) {
      await email.destroy();
      return `This action removes a #${id} email`;
    }
    throw new Error('Email not found');
  }
}
