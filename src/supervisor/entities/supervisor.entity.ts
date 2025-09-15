import { Area } from "src/area/entities/area.entity";
import { Asesor } from "src/asesor/asesor.entity";
import { Usuario } from "src/usuario/usuario.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Supervisor {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @Column()
    email: string;

    @Column()
    dni: string;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'usuarioId' })
    usuario: Usuario;

    @OneToMany(() => Area, area => area.supervisor)
    area: Area[];

    @OneToMany(() => Asesor, asesor => asesor.area)
    asesor: Asesor[];
}