import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import type { LoginPayload } from './types/int.types';
import type { ResponsePayload } from './types/int.types';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    // private configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise< string > {

    const user = await this.usersService.create(createUserDto);
     
    if (!user) {
      throw new Error('User registration failed');
    }

    return "User created successfully";
  }

  async login(loginPayload: LoginPayload): Promise<ResponsePayload> {
    try {
      //grab target user's details
      const user = await this.usersService.findByEmail(loginPayload.email);

      // verify password
      const valid = await bcrypt.compare(loginPayload.password, user.password);
      if (!valid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // check if they are an active member
      if (user.is_active === false){
        throw new UnauthorizedException("This user has been suspended due to failure to verify their account. Please contact your admin for further inquiries")
      }
      
      await this.usersService.update(user.id, { lastLogin: new Date() } as any);

      // generate and send access token to verified user
      const token = await this.generatetoken(user);
      const response: ResponsePayload = {
        userid: user.id,
        role: user.role,
        accessToken: token,
        email: user.email,
        name: `${user.fname} ${user.lname}`,
        company: user.company,
      }
      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw error;
    }
  }

  async generatetoken(userData: any): Promise<string> {
    const payload = { 
      sub: userData.id, 
      email: userData.email,
      role: userData.role
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
  }
}
