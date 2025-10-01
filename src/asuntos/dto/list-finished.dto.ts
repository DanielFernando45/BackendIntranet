import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Estado_Asesoria } from 'src/asesoramiento/entities/asesoramiento.entity';

export class listFinished {


  @IsString()
  @IsNotEmpty()
  titulo_asesor: string;

  @IsNotEmpty()
  @IsDateString()
  fecha_entregado: Date;

  @IsNotEmpty()
  @IsDateString()
  fecha_proceso: Date;

  @IsNotEmpty()
  @IsDateString()
  fecha_terminado: Date;

  @IsEnum(Estado_Asesoria)
  @IsNotEmpty()
  estado: string;
}
