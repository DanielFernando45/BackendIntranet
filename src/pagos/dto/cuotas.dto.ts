import { IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class Cuotas {
    @IsNumber()
    @Min(0)
    monto1: number;

    @IsDateString()
    fecha_pago1: string;

    @IsNumber()
    @Min(0)
    monto2: number;

    @IsOptional()
    @IsDateString()
    fecha_pago2?: string;  // 👈 Agregar fecha_pago2 como opcional

    @IsOptional()
    @IsNumber()
    @Min(0)
    monto3?: number;

    @IsOptional()
    @IsDateString()
    fecha_pago3?: string;  // 👈 Agregar fecha_pago3

    @IsOptional()
    @IsNumber()
    @Min(0)
    monto4?: number;

    @IsOptional()
    @IsDateString()
    fecha_pago4?: string;  // 👈 Agregar fecha_pago4

    @IsOptional()
    @IsNumber()
    @Min(0)
    monto5?: number;

    @IsOptional()
    @IsDateString()
    fecha_pago5?: string;  // 👈 Agregar fecha_pago5

    @IsOptional()
    @IsNumber()
    @Min(0)
    monto6?: number;

    @IsOptional()
    @IsDateString()
    fecha_pago6?: string;  // 👈 Agregar fecha_pago6
}