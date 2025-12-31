import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { roles } from './types/enum.types';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles([roles.admin])
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles([roles.admin])
  findAll() {
    return this.usersService.findAll();
  }

  //implement filtering logic later
  @Get('filter')
  @Roles([roles.admin])
  filter(@Query() query: any) {
    return `This action filters users`;
  }

  @Get(':id')
  @Roles([roles.admin, roles.user])
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles([roles.admin, roles.user])
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /*endpoint used to deactivate a user account if they haven't verified their accounts in
    a fortnight after signing up or the lastlogin date is over 3 months. In which case an admin has to 
    reactivate or delete the account
  */ 
  @Patch('/deactivate/:id')
  @Roles([roles.admin])
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Delete(':id')
  @Roles([roles.admin])
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
