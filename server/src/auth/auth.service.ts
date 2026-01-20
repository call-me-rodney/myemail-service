import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import type { LoginPayload, OTP } from './types/int.types';
import type { ResponsePayload } from './types/int.types';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<ResponsePayload> {
    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
    const hashed = await bcrypt.hash(createUserDto.password, saltRounds);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashed,
    } as any);

    if (!user) {
      throw new Error('User registration failed');
    }
    const token = await this.generatetoken(user);

    // initiate verification link here

    const response: ResponsePayload = {
      userid: user.id,
      role: user.role,
      accessToken: token,
    } 
    return response;
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

  async generateOTP(id: string): Promise<string> {
    /* 
    - generate a one time password that will expire after a day
    - save that password using the cache module for verification
    - send verification code via platform of choice
    */
    return "OTP successfully generated"
  }

  async verifyOTP(id: string, otp: OTP): Promise<string> {
    /*  
    - fetch the otp for the provided user id if it exists
    - compare OTP codes
    - set is_verified to true if verification successful
    - enable 5 more tries if not successful
    - beyond this, account will be automatically deactivated
    */
    return "Account verification successful"
  }
}
