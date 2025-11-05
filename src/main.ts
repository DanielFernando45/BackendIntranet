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
      'http://localhost', // ✅ ANDROID WEBVIEW (obligatorio)
      'capacitor://localhost', // ✅ Capacitor scheme
      'http://127.0.0.1',
      'http://localhost:5174',
      'http://192.168.1.42',
      'http://192.168.1.42:3000',
      'http://192.168.1.42:3001',
      'http://167.71.164.153',
      'http://167.71.164.153:3001',
      'https://intranet.alejandriaconsultora.com',
      'ionic://localhost',
      'http://localhost:8080', // algunos builds iOS usan este puerto
      'https://localhost', // certificados locales
    ],
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
    credentials: true,
    preflightContinue: false,
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
