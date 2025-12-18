import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Contact } from './models/contact.model';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(@InjectModel(Contact) private contactModel: typeof Contact) {}
  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = await this.contactModel.create(createContactDto as any);
    return contact;
  }

  async findAll(): Promise<Contact[]> {
    return await this.contactModel.findAll();
  }

  async findMultiple(user_id: string): Promise<Contact[]> {
    const contacts = await this.contactModel.findAll({
      where: { user_id }
    });
    return contacts;
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactModel.findByPk(id);
    if(!contact){
      throw new Error('Contact not found');
    }
    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto): Promise<Contact> {
    const contact = await this.findOne(id);
    await contact.update(updateContactDto);
    return contact;
  }

  async remove(id: string): Promise<string> {
    const contact = await this.findOne(id);
    await contact.destroy();
    return "Operation successful"
  }
}
