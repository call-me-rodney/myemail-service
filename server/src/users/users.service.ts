import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { VerificationRequest } from './types/int.types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userModel: typeof User){}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const created = await this.userModel.create(createUserDto as any);

    if (!created) {
      throw new Error('User creation failed');
    }
    
    return created.toJSON();
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.findAll();

    if (!users || users.length === 0) {
      throw new NotFoundException('No users found');
    }

    return users.map(user => user.toJSON());
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id);

    if(!user){
      throw new NotFoundException('User not found');
    }

    return user.toJSON();
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ 
      where: { email: email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.toJSON();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<string> {
    const userObj = await this.userModel.findByPk(id);

    if (!userObj) {
      throw new NotFoundException('User not found');
    }
    
    const user = userObj.toJSON();
    await userObj.update(updateUserDto)
    return `The user with ID: ${user.id} has been updated`;
  }

  // helper function for filtering out unverified users
  async fetchUnverified(company:string): Promise<string | string[]> {
    const users = await this.userModel.findAll({
      where: {
        is_verified : false,
        is_active : true,
        company: company
      }
    });

    if (!users){
      return "There are no unverified active users at the moment"
    }

    return users.map(user => user.toJSON());
  }

  async setVerified(verificationRequest: VerificationRequest): Promise<string> {
    const userObj = await this.userModel.findByPk(verificationRequest.userid);

    if (!userObj) {
      throw new NotFoundException('User not found');
    }

    const user = userObj.toJSON();
    await userObj.update({
      role: verificationRequest.role,
      email: `${user.fname}.${user.lname}@brevomail.com`,
      password: `${user.fname}${user.lname}@${user.company}`,
      is_verified: true,
      verified_at: new Date(),
      updated_at: new Date(),
      verified_by: verificationRequest.verified_by
    });

    // send twilio SMS here

    return `The user with ID: ${user.id} has been verified and activated`;
  }

  async deactivate(id: string): Promise<string> {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await user.update({ is_active: false });

    // send an SMS notifying the user of registration denia or removal from duty
  
    return `The user with ID: ${user.id} has been deactivated`;
  }

  async remove(id: string): Promise<string> {
    const userObj = await this.userModel.findByPk(id);

    if (!userObj) {
      throw new NotFoundException('User not found');
    }

    const user = userObj.toJSON();
    await userObj.destroy();
    return `User with id ${user.id} has been deleted`;
  }
}
