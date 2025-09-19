import {
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreatePagoPorCuotaDto {
  @IsNumber()
  @IsNotEmpty()
  pago_total: number;

  @IsNumber()
  @IsNotEmpty()
  numero_cuotas: number;

  @IsNumber()
  @IsNotEmpty()
  id_asesoramiento: number;
}
