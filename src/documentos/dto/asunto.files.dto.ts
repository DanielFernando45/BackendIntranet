import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Estado_Asesoria } from 'src/asesoramiento/entities/asesoramiento.entity';

export class asuntoFileDto {
  @IsInt()
  @IsNotEmpty()
  id_asunto: number;

  @IsString()
  @IsNotEmpty()
  asunto: {
    cliente: string;
    asesor: string;
  };
  
  @IsEnum(Estado_Asesoria)
  @IsNotEmpty()
  estado: Estado_Asesoria;

  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  [key: string]: any; // permite campos dinámicos como nombreDoc1, ruta1, etc.
}
