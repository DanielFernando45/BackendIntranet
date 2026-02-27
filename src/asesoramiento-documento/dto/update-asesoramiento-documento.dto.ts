import { PartialType } from '@nestjs/mapped-types';
import { CreateAsesoramientoDocumentoDto } from './create-asesoramiento-documento.dto';
import { IsOptional, IsArray, IsNumber } from 'class-validator';

export class UpdateAsesoramientoDocumentoDto extends PartialType(
  CreateAsesoramientoDocumentoDto,
) {
   @IsOptional()
  titulo?: string;

  @IsOptional()
  descripcion?: string;

  @IsOptional()
  archivosConservar?: string; // Cambiar a string
}
