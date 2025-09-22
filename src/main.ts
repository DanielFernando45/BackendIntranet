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
    origin: [`${process.env.FRONT_PORT_ENV}`],
    credentials: true,
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
