import { PartialType } from "@nestjs/mapped-types";
import { CreateHerramientaDto } from "./create-herramientas.dto";

export class UpdateHerramientasDto extends PartialType(CreateHerramientaDto){}