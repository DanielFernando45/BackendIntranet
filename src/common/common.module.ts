import { forwardRef, Module } from "@nestjs/common";
import { CommonController } from "./common.controller";
import { CommonService } from "./common.service";
import { ProcesosAsesoriaModule } from "src/procesos_asesoria/procesos_asesoria.module";
import { ReunionesModule } from "src/reuniones/reuniones.module";
import { AsuntosModule } from "src/asuntos/asuntos.module";
import { AsesoramientoModule } from "src/asesoramiento/asesoramiento.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TipoContrato } from "./entidades/tipoContrato.entity";
import { Asunto } from "src/asuntos/entities/asunto.entity";
import { Reunion } from "src/reuniones/entities/reunion.entity";
import { ProcesosAsesoria } from "src/procesos_asesoria/entities/procesos_asesoria.entity";
import { Contrato } from "src/contrato/entities/contrato.entity";

@Module({
    imports:[TypeOrmModule.forFeature([TipoContrato,Contrato, Asunto, Reunion, ProcesosAsesoria]),ProcesosAsesoriaModule,AsesoramientoModule,ReunionesModule,forwardRef(() =>AsuntosModule)],
    controllers:[CommonController],
    providers:[CommonService],
})
export class CommonModule{
}