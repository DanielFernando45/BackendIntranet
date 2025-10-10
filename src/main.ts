import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { ValidationError } from 'class-validator';

dotenv.config();

async function bootstrap() {
  // const httpsOptions = {
  //   key: fs.readFileSync('/etc/letsencrypt/live/api.alejandriaconsultora.com/privkey.pem'),
  //   cert: fs.readFileSync('/etc/letsencrypt/live/api.alejandriaconsultora.com/fullchain.pem'),
  // };

  // const app = await NestFactory.create(AppModule, { httpsOptions });
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      process.env.FRONT_PORT_ENV,
      'https://intranet.alejandriaconsultora.com',
      'http://localhost:5174',
      'http://137.184.97.175:3001',
      'http://backend:3000',
      'https://intranet.alejandriaconsultora.com:3001',
    ].filter(Boolean),
    methods: 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        console.error(
          '❌ Errores de validación:',
          JSON.stringify(errors, null, 2),
        );
        return new BadRequestException(errors);
      },
    }),
  );

  // ✅ Configurar timeout seguro (compatible con Node 22)
  const httpServer = app.getHttpServer();
  const nodeServer = httpServer?.listen ? httpServer : httpServer?.server;

  if (nodeServer && typeof nodeServer.setTimeout === 'function') {
    nodeServer.setTimeout(10 * 60 * 1000); // 10 minutos
    console.log('⏱️ Timeout del servidor configurado a 10 minutos.');
  } else {
    console.warn(
      '⚠️ No se pudo configurar el timeout del servidor (adaptador diferente).',
    );
  }

  await app.listen(3000, '0.0.0.0');
  console.log('🚀 Servidor iniciado en puerto 3000');
}

bootstrap();
