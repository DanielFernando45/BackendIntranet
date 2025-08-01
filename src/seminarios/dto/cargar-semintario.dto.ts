import { IsNotEmpty, IsString } from "class-validator";

export class CargarSeminarioDto {
    @IsString()
    @IsNotEmpty()
    readonly titulo: string;
}