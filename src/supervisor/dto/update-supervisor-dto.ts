import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsArray,
  ArrayNotEmpty,
  IsUUID,
} from 'class-validator';

export class UpdateSupervisorDto {
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(12)
  readonly dni?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  readonly nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  readonly apellido?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  readonly telefono?: string;

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true }) // si tus áreas usan UUID, cambia a IsInt si son numéricos
  readonly areasIds?: string[];
}
