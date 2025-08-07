import { PartialType } from '@nestjs/mapped-types';
import { CreateAsuntoDto } from './create-asunto.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAsuntoDto extends PartialType(CreateAsuntoDto) {

    @IsString()
    @IsNotEmpty()
    titulo: string;
}
