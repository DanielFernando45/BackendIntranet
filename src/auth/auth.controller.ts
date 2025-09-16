// import { Controller } from '@nestjs/common';

// @Controller('auth')
// export class AuthController {}

import {
  Controller,
  Post,
  Body,
  Param,
  BadRequestException,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/changue-password.dto';
import { Throttle } from '@nestjs/throttler';
import * as bcrypt from 'bcrypt';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Post('forget_password')
  async forget(@Body('email') email: string) {
    return this.authService.sendMailPassword(email);
  }

  @Patch('recover-password/:tokenJWT')
  async recoverPassword(
    @Param('tokenJWT') token: string,
    @Body() contraseñas: ChangePasswordDto,
  ) {
    const { newPassword, repeatPassword } = contraseñas;
    if (newPassword === repeatPassword) {
      return this.authService.recoverPassword(token, newPassword);
    }
    return new BadRequestException('La contraseñas no son iguales');
  }

  @Patch('change-password/:id')
  async changePassword(
    @Param('id') id: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      id,
      dto.oldPassword,
      dto.newPassword,
      dto.repeatPassword,
    );
  }
}
