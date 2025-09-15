import { IsString, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContratoDto {
  @IsString()
  servicio: string;

  @IsString()
  modalidad: string;

  @IsNumber()
  @Type(() => Number)
  idTipoTrabajo: number;  // number

  @IsNumber()
  @Type(() => Number)
  idTipoPago: number;     // number

  @IsUUID()
  idCategoria: string;    // UUID
}
