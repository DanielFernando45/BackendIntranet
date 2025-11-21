import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Entity } from 'typeorm';

@Entity('asesoramiento_videos')
export class CreateInduccionDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  titulo: string;

  @IsString()
  url: string;

  @IsString()
  capitulo: string;

  // @IsNumber()
  @IsNumber({}, { message: 'El id asesoramiento tiene que ser number' })
  @Type(() => Number)
  @IsNotEmpty({ message: 'El id asesoramiento es obligatorio' })
  asesoramiento: number;
}
