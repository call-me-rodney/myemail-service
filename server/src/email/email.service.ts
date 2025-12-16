
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Email } from './email.model';
import { CreateEmailDto } from './dto/create-emails.dto';
import { UpdateEmailDto } from './dto/update-emails.dto';

@Injectable()
export class EmailService {
  constructor(
    @InjectModel(Email)
    private emailModel: typeof Email,
  ) {}

  // Create a new email
  async create(createEmailDto: any): Promise<Email> {
    return this.emailModel.create(createEmailDto);
  }

  // admin route for fetching all emails
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

  // Fetch a single email by ID
  findOne(id: string): Promise<Email> {
    return this.emailModel.findOne({
      where: {
        id,
      },
    });
  }

  // Update an email by ID
  async update(id: string, updateEmailDto: any): Promise<Email> {
    const email = await this.findOne(id);
    return email.update(updateEmailDto);
  }

  // Delete an email by ID
  async remove(id: string): Promise<void> {
    const email = await this.findOne(id);
    await email.destroy();
  }
}
