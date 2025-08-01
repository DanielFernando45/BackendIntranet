import { IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto{
    @IsString()
    @MinLength(4)
    @MaxLength(50)
    readonly username:string;

    @IsString()
    @MinLength(6)
    @MaxLength(30)
    readonly password:string
}
