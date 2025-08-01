import { PartialType } from "@nestjs/mapped-types";
import { CreateSolucionDto } from "./create-solucion.dto";


export class UpdateSolucionDto extends PartialType(CreateSolucionDto){}