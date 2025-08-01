import { IsString, IsEmail, IsNotEmpty, IsNumber, IsUrl, IsInt, IsOptional } from 'class-validator';

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
    readonly url_imagen: string;

    // @IsInt()
    // @IsNotEmpty()
    // readonly tipoTrabajo: number;

    @IsString()
    @IsNotEmpty()
    readonly pais: string;

    @IsInt()
    @IsNotEmpty()
    readonly gradoAcademico: number;

    @IsString()
    @IsNotEmpty()
    readonly universidad: string;

    @IsString()
    @IsNotEmpty()
    readonly carrera:string;

    // @IsInt()
    // @IsNotEmpty()
    // readonly tipoContrato: number;

  // Puedes agregar también un usuario anidado si lo estás creando al mismo tiempo
  // readonly usuario: CreateUsuarioDto;
}