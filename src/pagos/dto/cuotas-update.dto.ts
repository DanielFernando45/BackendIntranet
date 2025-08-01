import { PartialType } from "@nestjs/mapped-types";
import { Cuotas } from "./cuotas.dto";

export class UpdateCuotasDto extends PartialType(Cuotas){}