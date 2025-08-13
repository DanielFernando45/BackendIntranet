import { IsISO8601, IsNotEmpty, IsOptional, } from "class-validator";

export class GetReunionFilterDto {
    @IsISO8601({strict:true})
    @IsOptional()
    fecha_reunion:Date;
}
