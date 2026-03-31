import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateMailingListDto } from './dto/create-mailing-list.dto';
import { UpdateMailingListDto } from './dto/update-mailing-list.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { roles } from 'src/users/types/enum.types';

@Controller('contacts')
@Roles([roles.companyadmin,roles.superadmin])
@UseGuards(AuthGuard, RolesGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@Req() req: Request, @Body() createContactDto: CreateContactDto) {
    const userId = (req as any).user?.sub || (req as any).user?.id;
    return this.contactsService.create({ ...createContactDto, user_id: userId });
  }

  @Get()
  findAll() {
    return this.contactsService.findAll();
  }

  @Get('user')
  findMultiple(@Req() req: Request) {
    const userId = (req as any).user?.sub || (req as any).user?.id;
    return this.contactsService.findMultiple(userId);
  }

  @Get('single/:id')
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }

  // Mailing List routes
  @Post('mailing-lists')
  createMailingList(@Req() req: Request, @Body() createMailingListDto: CreateMailingListDto) {
    const userId = (req as any).user?.sub || (req as any).user?.id;
    return this.contactsService.createMailingList({ ...createMailingListDto, user_id: userId });
  }

  @Get('mailing-lists')
  findAllMailingLists() {
    return this.contactsService.findAllMailingLists();
  }

  @Get('mailing-lists/user')
  findUserMailingLists(@Req() req: Request) {
    const userId = (req as any).user?.sub || (req as any).user?.id;
    return this.contactsService.findUserMailingLists(userId);
  }

  @Get('mailing-lists/:id')
  findOneMailingList(@Param('id') id: string) {
    return this.contactsService.findOneMailingList(id);
  }

  @Patch('mailing-lists/:id')
  updateMailingList(@Param('id') id: string, @Body() updateMailingListDto: UpdateMailingListDto) {
    return this.contactsService.updateMailingList(id, updateMailingListDto);
  }

  @Delete('mailing-lists/:id')
  removeMailingList(@Param('id') id: string) {
    return this.contactsService.removeMailingList(id);
  }
}
