import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { roles } from './types/enum.types';
import type { VerificationRequest } from './types/int.types';

@Controller('users')
@Roles([roles.companyadmin,roles.superadmin])
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Create an active user that hasn't been verified yet
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /*
  This should handle fetching all users,
  but also handle fetching users based on query parameters such as company, role, verification status, etc.
  */
  @Get()
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  // Retrieving a specific user
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // for updating user data
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // Sets is_verified to true, giving a user access to company assets
  // This also spares a user from being rendered inactive.
  @Patch('verify')
  setVerified(@Body() verificationRequest: VerificationRequest) {
    return this.usersService.setVerified(verificationRequest);
  }

  // Company or sys admins can deactivate a user, which sets is_active to false and deactivated_at to the current timestamp. 
  // This allows for soft deletion and potential reactivation in the future.
  @Patch('/deactivate/:id')
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  // sys admin permanantly deletes a database record
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
