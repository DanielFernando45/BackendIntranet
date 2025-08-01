import { PartialType } from "@nestjs/mapped-types";
import { CreateGuiaDto } from "./create-guia.dto";

export class UpdateGuiaDto extends PartialType(CreateGuiaDto){}