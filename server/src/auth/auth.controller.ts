import { Controller, Post, Body, Req, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { roles } from 'src/users/types/enum.types';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { LoginPayload, OTP, Plaform } from './types/int.types';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registration(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginPayload: LoginPayload) {
    return this.authService.login(loginPayload);
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Post('otp')
  @Roles([roles.user, roles.admin])
  generateOTP(@Req() req: Request, platform: Plaform){
    const userid = (req as any).user?.sub || (req as any).user?.id;
    return this.authService.generateOTP(userid, platform)
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Post('verify')
  @Roles([roles.admin,roles.user])
  verifyOTP(@Req() req: Request, otp: OTP) {
    const userid = (req as any).user?.sub || (req as any).user?.id;
    return this.authService.verifyOTP(userid,otp)
  }
}
