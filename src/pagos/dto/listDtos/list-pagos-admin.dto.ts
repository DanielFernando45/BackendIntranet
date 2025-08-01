import { InternalServerErrorException } from "@nestjs/common";
import { IsDateString, IsEnum, IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { tipoPago } from "src/pagos/entities/informacion_pagos.entity";


export class listPagosAdminDto{
    @IsNotEmpty()
    @IsNumber()
    id_infoPago:number;

    @IsNotEmpty()
    @IsString()
    delegado:string;

    @IsNotEmpty()
    @IsEnum(tipoPago)
    contrato:tipoPago;

    @IsNotEmpty()
    @IsDateString()
    fecha_ultimo_pago:Date;

    @IsNotEmpty()
    @IsNumber()
    ultimo_monto:number

}