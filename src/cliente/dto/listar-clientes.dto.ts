import { Type } from 'class-transformer';
import { IsString, IsEmail, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsObject, ValidateNested } from 'class-validator';


export class DatosAsesoramientoDto{
    // @IsString()
    // @IsNotEmpty()
    // readonly carrera:string;

    @IsString()
    readonly contrato:object;
 
    @IsDateString()
    @IsString()
    readonly fecha_inicio:Date|string;

    @IsDateString()
    @IsString()
    readonly fecha_fin:Date|string

}
export class ListarClientesDto {

  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  readonly apellido: string;

  @IsString()
  readonly universidad: string;

  // @IsString()
  // readonly carrera:string;

  // @IsString()
  // readonly tipoContrato: object; 

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(()=>DatosAsesoramientoDto)
  datos_asesoramiento:DatosAsesoramientoDto

  @IsDateString()
  @IsOptional()
  readonly fecha_creacion:Date;
}
