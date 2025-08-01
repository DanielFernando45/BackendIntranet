import { IsString, IsEmail, IsNotEmpty ,IsNumber, IsOptional} from 'class-validator';

export class UpdateClienteDto {//actualizar dtos
    @IsString()
    @IsOptional()
    readonly nombre: string;
    
    @IsEmail()
    @IsOptional()
    readonly email: string;

    @IsString()
    @IsOptional()
    readonly dni: string;

}