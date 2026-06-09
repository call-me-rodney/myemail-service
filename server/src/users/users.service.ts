import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { User } from './models/user.model';
import { VerificationRequest } from './types/int.types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
// import { SmsService } from 'src/common/sms/sms.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    // private readonly smsService: SmsService,
    private readonly configService: ConfigService,
  ){}

  async create(createUserDto: CreateUserDto): Promise<string> {
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const created = await this.userModel.create(createUserDto as any);

    if (!created) {
      throw new Error('User creation failed');
    }
    
    return "User creation successful. Await verification.";
    //return created.toJSON();
  }

  async findAll(query): Promise<User[]> {
    const users = await this.userModel.findAll({ where: query });

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
    
    if (updateUserDto.password){
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    const user = userObj.toJSON();
    await userObj.update(updateUserDto)
    return `The user with ID: ${user.id} has been updated`;
  }

  // helper function for filtering out unverified users
  // async fetchUnverified(company:string): Promise<string | string[]> {
  //   const users = await this.userModel.findAll({
  //     where: {
  //       is_verified : false,
  //       is_active : true,
  //       company: company
  //     }
  //   });

  //   if (!users){
  //     return "There are no unverified active users at the moment"
  //   }

  //   return users.map(user => user.toJSON());
  // }

  async setVerified(verificationRequest: VerificationRequest): Promise<string> {
    const userObj = await this.userModel.findByPk(verificationRequest.userid);

    if (!userObj) {
      throw new NotFoundException('User not found');
    }

    const user = userObj.toJSON();
   
    await userObj.update({
      role: verificationRequest.role,
      is_verified: true,
      verified_at: new Date(),
      last_updated: new Date(),
      verified_by: verificationRequest.verified_by
    });

    // send confirmation email instead
    //await this.smsService.send(user.phone, message);

    return `The user with ID: ${user.id} has been verified and activated`;
  }

  async deactivate(id: string): Promise<string> {
    const userObj = await this.userModel.findByPk(id);

    if (!userObj) {
      throw new NotFoundException('User not found');
    }

    await userObj.update({ is_active: false });
    const user = userObj.toJSON();

    // await this.smsService.send(user.phone, message);

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
