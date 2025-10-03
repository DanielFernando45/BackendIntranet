import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
import * as fs from 'fs';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  // const httpsOptions = {
  //   key: fs.readFileSync(
  //     '/etc/letsencrypt/live/api.alejandriaconsultora.com/privkey.pem',
  //   ),
  //   cert: fs.readFileSync(
  //     '/etc/letsencrypt/live/api.alejandriaconsultora.com/fullchain.pem',
  //   ),
  // };

  // const app = await NestFactory.create(AppModule, { httpsOptions });
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      `${process.env.FRONT_PORT_ENV}`,
      'https://intranet.alejandriaconsultora.com',
      'http://localhost:5174',
      'http://137.184.97.175:3001',
      'http://backend:3000'

    ],
    methods: 'GET, POST, PUT, DELETE, OPTIONS, PATCH', // Métodos HTTP permitidos
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With', // Encabezados permitidos
    credentials: true, // Permitir credenciales como cookies
    preflightContinue: false, // Deja que NestJS maneje la respuesta de preflight automáticamente
    optionsSuccessStatus: 204, // Responder con estado 204 para solicitudes preflight
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        // 👀 Esto imprimirá en consola todos los detalles de validación
        console.error(
          '❌ Errores de validación:',
          JSON.stringify(errors, null, 2),
        );
        return new BadRequestException(errors);
      },
    }),
  );

  await app.listen(3000, '0.0.0.0');
}

bootstrap();
