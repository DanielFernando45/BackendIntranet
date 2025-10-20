import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MailService } from './mail.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly authService: AuthService,
  ) {}
  
  @Get('test')
  async enviarPrueba(@Query('to') to: string) {
    return this.mailService.enviarCorreoPrueba(to);
  }
  
  @Post('reset-password')
  async resetPasswordRequest(@Body('email') email: string) {
    await this.authService.sendMailPassword(email);
    return { message: 'Si el correo está registrado, se ha enviado un enlace' };
  }

  @Post('new-password')
  async setNewPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return await this.mailService.setNewPassword(token, newPassword);
  }
}
