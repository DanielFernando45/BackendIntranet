import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePagoPorCuotaDto } from './create-pago-por-cuotas.dto';
import { Cuotas } from './cuotas.dto';
import { UpdatePagoPorCuotasDto } from './update-pago.dto';
import { UpdateCuotasDto } from './cuotas-update.dto';

export class PagoPorCuotaWrpDTO{
    @ValidateNested()
    @Type(()=>CreatePagoPorCuotaDto)
    createPagoPorCuotas:CreatePagoPorCuotaDto;

    @ValidateNested()
    @Type(()=>Cuotas)
    cuotas:Cuotas;
}

export class PagoPorCuotaUpdate{
    @ValidateNested()
    @Type(()=>UpdatePagoPorCuotasDto)
    updatePagoPorCuotas:UpdatePagoPorCuotasDto;

    @ValidateNested()
    @Type(()=>UpdateCuotasDto)
    updateCuotas:UpdateCuotasDto;
}
