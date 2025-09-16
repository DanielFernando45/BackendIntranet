import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsInt,
  IsEnum,
} from 'class-validator';
import { UserRole } from 'src/usuario/usuario.entity';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  readonly dni: string;

  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  readonly apellido: string;

  @IsNumber()
  @IsNotEmpty()
  readonly telefono: number;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsOptional()
  readonly url_imagen?: string;

  @IsString()
  @IsNotEmpty()
  readonly pais: string;

  @IsInt()
  @IsNotEmpty()
  readonly gradoAcademico: number; // número entero para el id del grado académico

  @IsString()
  @IsNotEmpty()
  readonly universidad: string;

  @IsString()
  @IsNotEmpty()
  readonly carrera: string;

  @IsEnum(UserRole)
  @IsOptional()
  readonly role?: UserRole; // opcional
}
