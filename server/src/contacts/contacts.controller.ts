import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
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
  create(@Req() req: Request, @Body() createContactDto: CreateContactDto) {
    const userId = (req as any).user?.sub || (req as any).user?.id;
    return this.contactsService.create({ ...createContactDto, user_id: userId });
  }

  @Get()
  @Roles([roles.admin])
  findAll() {
    return this.contactsService.findAll();
  }

  @Get('user')
  @Roles([roles.user, roles.admin])
  findMultiple(@Req() req: Request) {
    const userId = (req as any).user?.sub || (req as any).user?.id;
    return this.contactsService.findMultiple(userId);
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
