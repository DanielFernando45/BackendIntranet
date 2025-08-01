import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { Estado_asunto } from "../entities/asunto.entity";

export class ChangeToProcess{
    @IsDateString()
    @IsNotEmpty()
    fecha_terminado:Date;
}