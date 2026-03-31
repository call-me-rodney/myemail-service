import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { VerificationRequest } from './types/int.types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { SmsService } from 'src/common/sms/sms.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private readonly smsService: SmsService,
  ){}

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
    const dummyPass = `${(user.fname).toLowerCase()}${(user.lname).toLowerCase()}@${user.company}`;
    const newEmail = `${(user.fname).toLowerCase()}.${(user.lname).toLowerCase()}@brevomail.com`;
    const hashedDummyPass = await bcrypt.hash(dummyPass , 10);
    await userObj.update({
      role: verificationRequest.role,
      email: newEmail,
      password: hashedDummyPass,
      is_verified: true,
      verified_at: new Date(),
      updated_at: new Date(),
      verified_by: verificationRequest.verified_by
    });

    const loginUrl: string = `https://${process.env.LOCALHOST}/login`;
    const message: string = `Congratulations, your request to join the mailing team at ${user.company} has been approved. Please log into your portal at ${loginUrl} with the following credentials: email: ${newEmail}, password: ${dummyPass}. Be sure to change your login password as soon as possible.`;
    await this.smsService.send(user.phone, message);

    return `The user with ID: ${user.id} has been verified and activated`;
  }

  async deactivate(id: string): Promise<string> {
    const userObj = await this.userModel.findByPk(id);

    if (!userObj) {
      throw new NotFoundException('User not found');
    }

    await userObj.update({ is_active: false });
    const user = userObj.toJSON();

    const message: string = `Dear user, we regret to inform you that your account or registration request has been rejected and you will no longer be able to send mails on behalf of ${user.company}. We wish you the best in your endeavours.`;
    await this.smsService.send(user.phone, message);

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
