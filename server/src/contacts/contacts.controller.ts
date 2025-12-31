import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { roles } from 'src/users/types/enum.types';

@Controller('contacts')
@UseGuards(AuthGuard, RolesGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @Roles([roles.user, roles.admin])
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  @Roles([roles.admin])
  findAll() {
    return this.contactsService.findAll();
  }

  @Get('user/:user_id')
  @Roles([roles.user, roles.admin])
  findMultiple(@Param('user_id') user_id: string) {
    return this.contactsService.findMultiple(user_id);
  }

  @Get('single/:id')
  @Roles([roles.user, roles.admin])
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Patch(':id')
  @Roles([roles.user, roles.admin])
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  @Roles([roles.admin])
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}
