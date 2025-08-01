import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class clientesExtraDTO{

    @IsNumber()
    @IsNotEmpty()
    delegado:number;

    @IsNumber()
    @IsOptional()
    id_cliente2:number;

    @IsNumber()
    @IsOptional()
    id_cliente3:number;

    @IsNumber()
    @IsOptional()
    id_cliente4:number;

    @IsNumber()
    @IsOptional()
    id_cliente5:number;

}