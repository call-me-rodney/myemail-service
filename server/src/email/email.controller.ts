import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { roles } from 'src/users/types/enum.types';
import { Status } from './types/enums.types';

@Controller('email')
@UseGuards(AuthGuard, RolesGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  @Roles([roles.user, roles.admin])
  create(@Req() req: Request, @Body() createEmailDto: CreateEmailDto) {
    const userId = (req as any).user?.sub || (req as any).user?.id;
    return this.emailService.create({ ...createEmailDto, user_id: userId });
  }

  @Get()
  @Roles([roles.admin])
  findAll() {
    return this.emailService.findAll();
  }

  @Get('user')
  @Roles([roles.user, roles.admin])
  findMultiple(@Req() req: Request) {
    const userId = (req as any).user?.sub || (req as any).user?.id;
    return this.emailService.findMultiple(userId);
  }

  @Get('single/:id')
  @Roles([roles.user, roles.admin])
  findOne(@Param('id') id: string) {
    return this.emailService.findOne(id);
  }

  // Update email - mainly for updating status to 'pending' to trigger sending
  @Patch(':id')
  @Roles([roles.user, roles.admin])
  async update(@Param('id') id: string, @Body() updateEmailDto: UpdateEmailDto) {
    if (updateEmailDto.status === Status.Pending) {
      const emailPayload = await this.emailService.findOne(id);
      this.emailService.handleOutboundMail(emailPayload);
    }

    return this.emailService.update(id, updateEmailDto);
  }

  @Delete(':id')
  @Roles([roles.admin])
  remove(@Param('id') id: string) {
    return this.emailService.remove(id);
  }

}
