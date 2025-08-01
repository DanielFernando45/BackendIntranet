import { PartialType } from '@nestjs/mapped-types';
import { CreatePagoPorCuotaDto } from './create-pago-por-cuotas.dto';
import { CreatePagoAlContadoDto } from './create-pago-al-contado.dto';

export class UpdatePagoPorCuotasDto extends PartialType(CreatePagoPorCuotaDto) {}

export class UpdatePagoContadoDto extends PartialType(CreatePagoAlContadoDto) {}
