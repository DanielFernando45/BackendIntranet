import { IsString, MinLength, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { UserRole } from 'src/usuario/usuario.entity';
export class CreateUserDto {
  @IsString()
  @MinLength(4)
  username: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsOptional()
  readonly id_rol?: number;

  @IsEnum(UserRole)
  @IsOptional()
  readonly role?: UserRole;

  @IsBoolean()
  estado: boolean;
}
