import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePagoAlContadoDto {
    @IsString()
    @IsOptional()
    titulo?:string;

    @IsNumber()
    @IsNotEmpty()
    pago_total:number;

    @IsDateString()
    @IsNotEmpty()
    fecha_pago:Date;

    @IsNumber()
    @IsNotEmpty()
    id_asesoramiento:number; 
}