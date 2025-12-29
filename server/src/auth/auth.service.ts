import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
  ) {}

  async register(createUserDto: CreateUserDto): Promise<ResponsePayload> {
    const hashed = await bcrypt.hash(createUserDto.password, 10);
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
      const user = await this.usersService.findByEmail(loginPayload.email);

      const valid = await bcrypt.compare(loginPayload.password, user.password);
      if (!valid) {
        throw new UnauthorizedException('Invalid credentials');
      }

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
}
