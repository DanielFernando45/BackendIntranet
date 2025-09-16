import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
} from 'class-validator';
import { UserRole } from 'src/usuario/usuario.entity';

export class createSupervisorDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly dni: string;

  @IsArray()
  @IsOptional()
  readonly areasIds?: string[];

  @IsEnum(UserRole)
  @IsOptional()
  readonly role?: UserRole; // <- ahora se puede pasar
}
