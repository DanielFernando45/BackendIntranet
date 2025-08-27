import { IsBoolean, IsString, IsUUID, MinLength } from "class-validator";
import { UserRole } from "../usuario.entity";

export class CreateUserDto{
    @IsString()
    @MinLength(4)
    username:string

    @IsString()
    @MinLength(4)
    password:string

    // @IsUUID()
    // role: string;

    @IsBoolean()
    estado:boolean
}