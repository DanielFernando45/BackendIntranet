import { IsBoolean, IsString, MinLength } from "class-validator";
import { UserRole } from "../usuario.entity";

export class CreateUserDto{
    @IsString()
    @MinLength(4)
    username:string

    @IsString()
    @MinLength(4)
    password:string
    
    role: UserRole

    @IsBoolean()
    estado:boolean
}