import { PartialType } from '@nestjs/mapped-types';
import { CreateSoporteDto } from './create-soporte.dto';

export class UpdateSoporteDto extends PartialType(CreateSoporteDto) {}
