import { TipoContrato } from "src/common/entidades/tipoContrato.entity";
import { TipoTrabajo } from "src/common/entidades/tipoTrabajo.entity";
import { Informacion_Pagos } from "src/pagos/entities/informacion_pagos.entity";
import { ProcesosAsesoria } from "src/procesos_asesoria/entities/procesos_asesoria.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum Estado_Asesoria{
    ACTIVO="activo",
    DESACTIVADO="desactivado",
    FINALIZADO="finalizado"
}

export enum Tipo_Servicio{
    PROYECTO="proyecto",
    INFORME_FINAL="informe_final",
    COMPLETO="completo"
}

@Entity()
export class Asesoramiento {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    profesion_asesoria:string;

    @Column({type:'enum',enum:Estado_Asesoria})
    estado:Estado_Asesoria;


    @OneToMany(() => ProcesosAsesoria, procesosasesoria => procesosasesoria.asesoramiento)
    procesosasesoria: ProcesosAsesoria[];

    @OneToMany(()=>Informacion_Pagos,informacion_pago=>informacion_pago.asesoramiento)
    informacion_pago:Informacion_Pagos[]
}
