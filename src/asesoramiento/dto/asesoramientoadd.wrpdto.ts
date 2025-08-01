import { clientesExtraDTO } from 'src/procesos_asesoria/dto/clientes_extra.dto';
import { CreateAsesoramientoDto } from './create-asesoramiento.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateAsesoramientoDto } from './update-asesoramiento.dto';

export class AsesoramientoWrpDTO{
    @ValidateNested()
    @Type(()=>CreateAsesoramientoDto)
    createAsesoramiento:CreateAsesoramientoDto;

    @ValidateNested()
    @Type(()=>clientesExtraDTO)
    clientes:clientesExtraDTO;
}

export class AsesoramientoUpdateWrpDTO{
    @ValidateNested()
    @Type(()=>UpdateAsesoramientoDto)
    createAsesoramiento:UpdateAsesoramientoDto;

    @ValidateNested()
    @Type(()=>clientesExtraDTO)
    clientes:clientesExtraDTO;
}