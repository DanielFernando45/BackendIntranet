import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class FechasValuePipe implements PipeTransform{
    //constructor(private readonly fechas:any){}
    transform(value:string):Date{

    const fecha_filtro = new Date();

    switch (value) {
        case "ultimo_dia":
            fecha_filtro.setDate(fecha_filtro.getDate() - 1);
            return fecha_filtro;

        case "ultima_semana":
            fecha_filtro.setDate(fecha_filtro.getDate() - 7);
            return fecha_filtro;

        case "ultimo_mes":
            fecha_filtro.setDate(fecha_filtro.getDate() - 30);
            return fecha_filtro;

        case "ultimo_año":
            fecha_filtro.setDate(fecha_filtro.getDate() - 365);
            return fecha_filtro;

        default:
            throw new BadRequestException(`El valor '${value}' no es un filtro de fecha válido.`);
    }
    }
}