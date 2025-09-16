import { IsString, IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { IsOptional, IsEnum } from 'class-validator';
import { UserRole } from 'src/usuario/usuario.entity';

export class CrearAdminDto {
  //actualizar dtos
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly dni: string;

  @IsEnum(UserRole)
  @IsOptional()
  readonly role?: UserRole; // <- ahora se puede pasar
}
