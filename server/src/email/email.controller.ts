import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { roles } from 'src/users/types/enum.types';

@Controller('email')
@UseGuards(AuthGuard, RolesGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  @Roles([roles.user, roles.admin])
  create(@Body() createEmailDto: CreateEmailDto) {
    return this.emailService.create(createEmailDto);
  }

  @Get()
  @Roles([roles.admin])
  findAll() {
    return this.emailService.findAll();
  }

  @Get('user/:user_id')
  @Roles([roles.user, roles.admin])
  findMultiple(@Param('user_id') user_id: string) {
    return this.emailService.findMultiple(user_id);
  }

  @Get('single/:id')
  @Roles([roles.user, roles.admin])
  findOne(@Param('id') id: string) {
    return this.emailService.findOne(id);
  }

  @Patch(':id')
  @Roles([roles.user, roles.admin])
  update(@Param('id') id: string, @Body() updateEmailDto: UpdateEmailDto) {
    return this.emailService.update(id, updateEmailDto);
  }

  @Delete(':id')
  @Roles([roles.admin])
  remove(@Param('id') id: string) {
    return this.emailService.remove(id);
  }

  /*post route for sending emails that have been created through email provider
  makes use of emailService.markAsSent
  */
}
