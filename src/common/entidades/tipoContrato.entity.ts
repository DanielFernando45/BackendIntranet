import { Asesoramiento } from "src/asesoramiento/entities/asesoramiento.entity";
import { Cliente } from "src/cliente/cliente.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TipoContrato{
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    nombre:string

    // @Column()
    // tipo_contrato:string

    // @Column()
    // tipo_entrega:string

    // @Column()
    // modalidad:string

    // @OneToMany(() => Asesoramiento, asesoramiento => asesoramiento.tipoContrato)
    // asesoramientos: Asesoramiento[];
}