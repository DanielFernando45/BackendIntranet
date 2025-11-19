import { PartialType } from '@nestjs/mapped-types';
import { CreateAsesoramientoDocumentoDto } from './create-asesoramiento-documento.dto';

export class UpdateAsesoramientoDocumentoDto extends PartialType(
  CreateAsesoramientoDocumentoDto,
) {}
