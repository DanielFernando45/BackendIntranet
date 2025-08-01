import { Asunto } from "src/asuntos/entities/asunto.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum Subido{
    ESTUDIANTE="estudiante",
    ASESOR="asesor"
}
@Entity()
export class Documento {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    nombre:string;

    @Column()
    ruta:string;

    @Column({type:"enum",enum:Subido})
    subido_por:Subido;

    @Column()
    created_at:Date

    @ManyToOne(()=>Asunto)
    @JoinColumn({name:"id_asunto"})
    asunto:Asunto

}
