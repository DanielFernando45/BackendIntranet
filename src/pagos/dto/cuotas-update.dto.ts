import { PartialType } from "@nestjs/mapped-types";
import { Cuotas } from "./cuotas.dto";
import { IsOptional, IsNumber, Min, Max } from 'class-validator';

// Extiende de Cuotas pero también puede incluir numero_cuotas
export class UpdateCuotasDto extends PartialType(Cuotas) {
    @IsOptional()
    @IsNumber()
    @Min(2)
    @Max(6)
    numero_cuotas?: number;
}