import * as nodemailer from 'nodemailer';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from 'src/cliente/cliente.entity';
import { Usuario } from 'src/usuario/usuario.entity';
import { Asesor } from 'src/asesor/asesor.entity';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class MailService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    @InjectRepository(Cliente)
    private clientRepository: Repository<Cliente>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  async enviarCorreoPrueba(destino: string) {
    try {
      await this.mailerService.sendMail({
        to: destino,
        subject: '📬 Prueba de correo desde producción',
        template: 'test', // archivo: templates/test.hbs
        context: {
          nombre: 'Usuario de Prueba',
        },
      });
      console.log('Correo enviado correctamente');
      return { success: true, message: 'Correo enviado' };
    } catch (error) {
      console.error('Error al enviar correo:', error);
      return { success: false, message: 'Error al enviar correo', error };
    }
  }

  async sendResetPasswordEmail(to: string, resetUrl: string): Promise<boolean> {
    const mailOptions = {
      from: `"IntranetAlejandria" <${process.env.GMAIL}>`,
      to,
      subject: 'Recuperación de contraseña',
      html: `
      <body style="background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); text-align: center; padding: 40px 30px;">
    
    <img src="https://f004.backblazeb2.com/file/IntranetAlejandria/LogoOscuro.svg" alt="Logo de la Empresa" style="max-width: 100px; margin-bottom: 20px;">

    <h1 style="color: #003049; font-size: 24px; margin: 0;">¿Olvidaste tu contraseña?</h1>
    
    <p style="font-size: 16px; color: #333; margin: 20px 0;">
      No te preocupes, puedes establecer una nueva contraseña haciendo clic en el botón siguiente:
    </p>

    <a href="${resetUrl}" style="display: inline-block; background-color: #00bcd4; color: white; text-decoration: none; padding: 15px 30px; font-size: 16px; border-radius: 5px; margin-top: 30px; transition: background-color 0.3s ease;">
      Recuperar contraseña
    </a>

    <p style="font-size: 16px; color: #333; margin: 20px 0;">
      Si no solicitaste este cambio, puedes ignorar este mensaje.
    </p>

    <div style="margin-top: 40px; font-size: 12px; color: #777;">
      © 2025 Tu Empresa. Todos los derechos reservados.
    </div>
  </div>
       
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Correo enviado:', info.response);
      return true;
    } catch (error) {
      console.error('Error enviando el correo:', error);
      return false;
    }
  }

  async setNewPassword(token: string, newPassword: string) {
    let payload: any;
    try {
      // Solo esta parte debe lanzar error de token inválido
      payload = this.jwtService.verify(token);
    } catch (err) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const email = payload.email;

    // Esta parte ya es lógica de negocio, no errores de JWT
    const cliente = await this.clientRepository.findOne({
      where: { email },
      relations: ['usuario'],
    });

    if (!cliente || !cliente.usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    cliente.usuario.password = hashedPassword;
    await this.usuarioRepository.save(cliente.usuario);

    return { message: 'Contraseña actualizada correctamente' };
  }

  async sendAvanceClienteEmail(
    to: string,
    asesorNombre: string,
    profesion: string,
  ) {
    const mailOptions = {
      from: `"Intranet Alejandría" <${process.env.GMAIL}>`,
      to,
      subject: `Nuevo avance de tu asesor (${asesorNombre})`,
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; border-radius: 8px;">
        <h2 style="color:#003049;">Nuevo avance en tu asesoría</h2>
        <p>El asesor <b>${asesorNombre}</b> ha enviado un nuevo avance en tu asesoría <b>"${profesion}"</b>.</p>
        <p>Puedes revisarlo directamente en tu cuenta de la intranet.</p>
        <br/>
        <p style="color:#777;">Atentamente,<br>Equipo Alejandría Consultores</p>
      </div>
    `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✉️ Correo enviado al cliente:', info.response);
    } catch (error) {
      console.error('❌ Error enviando correo al cliente:', error);
    }
  }
}
