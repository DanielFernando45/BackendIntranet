import { IsNotEmpty, IsString, IsDateString, IsInt } from 'class-validator';

export class CreateAsesoramientoDocumentoDto {
  @IsNotEmpty()
  @IsString()
  titulo: string;
}
