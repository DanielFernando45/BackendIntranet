import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class Cuotas{
    @IsNumber()
    @IsOptional()
    monto1:number;

    @IsDateString()
    @IsOptional()
    fecha_pago1:Date;

    @IsNumber()
    @IsOptional()
    monto2:number;

    @IsDateString()
    @IsOptional()
    fecha_pago2?:Date;

    @IsNumber()
    @IsOptional()
    monto3?:number;

    @IsDateString()
    @IsOptional()
    fecha_pago3?:Date;
}