import { IsEmail, IsOptional, IsString } from "class-validator";

export class updatedByClient{
    @IsString()
    @IsOptional()
    readonly url_imagen:string;

}