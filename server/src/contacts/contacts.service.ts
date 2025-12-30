import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Contact } from './models/contact.model';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(@InjectModel(Contact) private contactModel: typeof Contact) {}
  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = await this.contactModel.create(createContactDto as any);
    return contact.toJSON();
  }

  async findAll(): Promise<Contact[]> {
    const contacts = await this.contactModel.findAll();

    if (contacts.length === 0) {
      throw new NotFoundException('No contacts found');
    }
    
    return contacts.map(contact => contact.toJSON());
  }

  async findMultiple(user_id: string): Promise<Contact[]> {
    const contacts = await this.contactModel.findAll({
      where: { user_id: user_id }
    });

    if (contacts.length === 0) {
      throw new NotFoundException('No contacts found for this user');
    }

    return contacts.map(contact => contact.toJSON());
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactModel.findByPk(id);

    if(!contact){
      throw new NotFoundException('Contact not found');
    }
    
    return contact.toJSON();
  }

  async update(id: string, updateContactDto: UpdateContactDto): Promise<Contact> {
    const contact = await this.contactModel.findOne({
      where:{id:id},
    });

    if(!contact){ 
      throw new NotFoundException('Contact not found');
    }

    await contact.update(updateContactDto);
    return contact.toJSON();
  }

  async remove(id: string): Promise<string> {
    const contact = await this.contactModel.findOne({
      where:{id:id},
    });

    if(!contact){ 
      throw new NotFoundException('Contact not found');
    }

    await contact.destroy();
    return "Operation successful"
  }
}
