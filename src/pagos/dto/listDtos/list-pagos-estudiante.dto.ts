import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { estadoPago } from "src/pagos/entities/pago.entity";

export class listPagosEstudianteDto{
    @IsNotEmpty()
    @IsString()
    titulo:string;

    @IsNotEmpty()
    @IsNumber()
    monto:number;

    @IsNotEmpty()
    @IsDateString()
    fecha_pago:Date|null;

    @IsNotEmpty()
    @IsEnum(estadoPago)
    estado_pago:estadoPago;
}