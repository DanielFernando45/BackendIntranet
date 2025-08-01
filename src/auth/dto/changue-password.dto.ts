import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class ChangePasswordDto{
    @IsString()
    @IsOptional()
    @MinLength(4)
    @MaxLength(50)
    readonly oldPassword:string;

    @IsString()
    @MinLength(6)
    @MaxLength(30)
    readonly newPassword:string;

    @IsString()
    @MinLength(6)
    @MaxLength(30)
    readonly repeatPassword:string
}