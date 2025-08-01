import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Informacion_Pagos } from "./informacion_pagos.entity";

export enum estadoPago{
    PAGADO="pagado",
    POR_PAGAR="por_pagar"
}

@Entity()
export class Pago {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    nombre:string;

    @Column()
    monto:number;

    @Column({nullable:true})
    fecha_pago:Date;

    @Column({type:'enum',enum:estadoPago})
    estado_pago:estadoPago

    @ManyToOne(()=>Informacion_Pagos)
    @JoinColumn({name:"id_informacion_pago"})
    informacion_pago:Informacion_Pagos
}
