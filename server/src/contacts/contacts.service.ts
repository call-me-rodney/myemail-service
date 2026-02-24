import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Contact } from './models/contact.model';
import { MailingList } from './models/mailing-list.model';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateMailingListDto } from './dto/create-mailing-list.dto';
import { UpdateMailingListDto } from './dto/update-mailing-list.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact) private contactModel: typeof Contact,
    @InjectModel(MailingList) private mailingListModel: typeof MailingList,
  ) {}
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

  // Mailing List methods
  async createMailingList(createMailingListDto: CreateMailingListDto): Promise<MailingList> {
    const mailingList = await this.mailingListModel.create(createMailingListDto as any);
    return mailingList.toJSON();
  }

  async findAllMailingLists(): Promise<MailingList[]> {
    const lists = await this.mailingListModel.findAll();
    if (lists.length === 0) {
      throw new NotFoundException('No mailing lists found');
    }
    return lists.map(list => list.toJSON());
  }

  async findUserMailingLists(user_id: string): Promise<MailingList[]> {
    const lists = await this.mailingListModel.findAll({
      where: { user_id: user_id },
      order: [['created_at', 'DESC']],
    });

    if (lists.length === 0) {
      return []; // Return empty array instead of throwing error
    }

    return lists.map(list => list.toJSON());
  }

  async findOneMailingList(id: string): Promise<MailingList> {
    const mailingList = await this.mailingListModel.findByPk(id);
    if (!mailingList) {
      throw new NotFoundException('Mailing list not found');
    }
    return mailingList.toJSON();
  }

  async updateMailingList(id: string, updateMailingListDto: UpdateMailingListDto): Promise<MailingList> {
    const mailingList = await this.mailingListModel.findOne({
      where: { id: id },
    });

    if (!mailingList) {
      throw new NotFoundException('Mailing list not found');
    }

    await mailingList.update(updateMailingListDto);
    return mailingList.toJSON();
  }

  async removeMailingList(id: string): Promise<string> {
    const mailingList = await this.mailingListModel.findOne({
      where: { id: id },
    });

    if (!mailingList) {
      throw new NotFoundException('Mailing list not found');
    }

    await mailingList.destroy();
    return "Mailing list deleted successfully";
  }
}
