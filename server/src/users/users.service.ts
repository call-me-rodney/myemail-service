import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { User } from './models/user.model';
import { VerificationRequest } from './types/int.types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { EmailNotificationService } from 'src/common/providers/emailNotification.service';
import { NotifyParams } from 'src/common/types/int.types';
import emailjs, { EmailJSResponseStatus } from '@emailjs/nodejs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private readonly emailNotificationService: EmailNotificationService,
    private readonly configService: ConfigService,
  ){}
  private readonly logger = new Logger(UsersService.name);

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

  async setVerified(verificationRequest: VerificationRequest): Promise<string | void> {
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

    const notifyParams: NotifyParams = {
      title: "MAILING RIGHTS ACCESS",
      name: "info@mailservice.me", 
      from_name: "info",
      // insert frontend login page link below
      message: `Congratulations, you have been granted access rights to manage campaign mails on behalf of ${user.company} . Use the email and password you created at registration through the following link: `,
      to_email: user.email,
      from_email: "info@mailservice.me",
      serviceId: "service_x7sgsil",
      templateId: "template_8w8ybsv"
    }

    // send confirmation email instead
    await this.emailNotificationService.sendNotification(notifyParams);
  }

  async deactivate(id: string): Promise<string> {
    const userObj = await this.userModel.findByPk(id);

    if (!userObj) {
      throw new NotFoundException('User not found');
    }

    await userObj.update({ is_active: false });
    const user = userObj.toJSON();

    const notifyParams:NotifyParams = {
      title: "MAILING RIGHTS ACCESS",
      name: "info@mailservice.me", 
      from_name: "info",
      // insert frontend login page link below
      message: `This is to inform you that you have been denied access to send mails on behalf of ${user.company} . We apologize for any inconviniences caused`,
      to_email: user.email,
      from_email: "info@mailservice.me",
      serviceId: "service_x7sgsil",
      templateId: "template_8w8ybsv"
    }

    // send confirmation email instead
    await this.emailNotificationService.sendNotification(notifyParams);

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
