import { Asesor } from "src/asesor/asesor.entity";
import { Cliente } from "src/cliente/cliente.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class GradoAcademico{
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    nombre:string

    @OneToMany(() => Cliente, cliente => cliente.gradoAcademico)
    clientes: Cliente[];

    @OneToMany(() => Asesor, asesor=> asesor.gradoAcademico)
    asesores: Asesor[];
}