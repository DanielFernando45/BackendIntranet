import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProcesosAsesoriaService } from '../../procesos_asesoria/procesos_asesoria.service';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class IsDelegadoGuard implements CanActivate {
  constructor(
    private readonly procesosAsesoriaService: ProcesosAsesoriaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    console.log('DEBUG: req.user =', req.user);
    const user = req.user as { id: number; username: string; role: string };
    console.log('DEBUG: user =', user);
    if (user === undefined)
      throw new BadRequestException('No es valido ingrese correctamente');
    console.log(req.user)
    const id_asesoramiento =
      req.params.id_asesoramiento || req.body.id_asesoramiento;
    const asesoramientoId = parseInt(id_asesoramiento);

    if (!asesoramientoId)
      throw new UnauthorizedException('Id de asesoramiento no proporcionado');

    const cliente =
      await this.procesosAsesoriaService.getDelegado(asesoramientoId);
    console.log(cliente.clienteId);

    if (cliente.clienteId !== user.id)
      throw new UnauthorizedException(
        'Solo el delegado puede realizar esta accion',
      );

    return true;
  }
}
