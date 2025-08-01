import { IsString, IsEmail, IsNotEmpty ,IsNumber, IsOptional} from 'class-validator';

export class updateClienteDto {//actualizar dtos
    @IsString()
    @IsOptional()
    readonly dni: string;

    @IsString()
    @IsOptional()
    readonly nombre: string;

    @IsString()
    @IsOptional()
    readonly apellido: string;

    @IsNumber()
    @IsOptional()
    readonly telefono: number;

    @IsEmail()
    @IsOptional()
    readonly email: string;

    @IsString()
    @IsOptional()
    readonly url_imagen:string;

    // @IsNumber()
    // @IsOptional()
    // readonly tipoTrabajo:number;

    @IsString()
    @IsOptional()
    readonly pais:string;

    @IsNumber()
    @IsOptional()
    readonly gradoAcademico:number;

    @IsString()
    @IsOptional()
    readonly universidad:string;

    @IsString()
    @IsOptional()
    readonly carrera:string;

    // @IsNumber()
    // @IsOptional()
    // readonly tipoContrato:number;

}