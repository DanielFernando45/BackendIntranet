import { IsDate, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAsesoramientoDto {


    @IsString()
    @IsOptional()
    profesion_asesoria: string;

    @IsString()
    estado: string;
    // @IsNumber()
    // @IsOptional()
    // id_asesor?:number;
    
    // @IsString()
    // @IsOptional()
    // profesion_asesoria?:string;

    // @IsString()
    // @IsOptional()
    // especialidad?:string;

    // @IsEnum(Tipo_Servicio)
    // @IsOptional()
    // tipo_servicio:Tipo_Servicio;
    
    // @IsInt()
    // @IsOptional()
    // id_contrato?:number;
    
    // @IsInt()
    // @IsOptional()
    // id_tipo_trabajo?:number;

    // @IsDate()
    // @IsOptional()
    // @Type(() => Date)
    // fecha_inicio?:Date;

    // @IsDate()
    // @IsOptional()
    // @Type(() => Date)
    // fecha_fin?:Date

}
