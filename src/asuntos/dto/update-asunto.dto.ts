import { PartialType } from '@nestjs/mapped-types';
import { CreateAsuntoDto } from './create-asunto.dto';

export class UpdateAsuntoDto extends PartialType(CreateAsuntoDto) {}
