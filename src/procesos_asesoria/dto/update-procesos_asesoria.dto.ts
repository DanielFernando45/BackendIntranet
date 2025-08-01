import { PartialType } from '@nestjs/mapped-types';
import { CreateProcesosAsesoriaDto } from './create-procesos_asesoria.dto';

export class UpdateProcesosAsesoriaDto extends PartialType(CreateProcesosAsesoriaDto) {}
