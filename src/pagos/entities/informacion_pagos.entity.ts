import { Asesoramiento } from "src/asesoramiento/entities/asesoramiento.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Pago } from "./pago.entity";

export enum tipoPago{
    CONTADO="contado",
    CUOTAS="cuotas"
}

export enum tipoServicio{
    ASESORIA="asesoria",
    OTROS="otros"
}

@Entity()
export class Informacion_Pagos{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    titulo:string;

    @Column()
    pago_total:number;

    @Column({type:'enum',enum:tipoPago})
    tipo_pago:tipoPago;

    @Column({type:'enum',enum:tipoServicio})
    tipo_servicio:tipoServicio

    @Column({nullable:true})
    numero_cuotas:number;

    @Column()
    fecha_creado:Date;

    @ManyToOne(()=>Asesoramiento)
    @JoinColumn({name:'id_asesoramiento'})
    asesoramiento:Asesoramiento

    @OneToMany(()=>Pago,pago=>pago.informacion_pago)
    pagos:Pago[]
}