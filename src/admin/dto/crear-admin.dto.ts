import { IsString, IsEmail, IsNotEmpty ,IsNumber} from 'class-validator';

export class CrearlienteDto {//actualizar dtos
    @IsString()
    @IsNotEmpty()
    readonly nombre: string;
    
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    readonly dni: string;

}