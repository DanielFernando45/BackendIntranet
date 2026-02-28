import { IsNumber, Min, Max } from 'class-validator';

export class CreatePagoPorCuotaDto {
    @IsNumber()
    @Min(0)
    pago_total: number;

    @IsNumber()
    @Min(2)
    @Max(6)
    numero_cuotas: number;

    @IsNumber()
    id_asesoramiento: number;
}