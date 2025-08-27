import { Area } from "src/area/entities/area.entity";
import { Asesor } from "src/asesor/asesor.entity";
import { Usuario } from "src/usuario/usuario.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class Supervisor {
    @PrimaryColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @Column()
    email: string;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'usuarioId' })
    usuario: Usuario;

    @ManyToOne(() => Area)
    @JoinColumn({ name: 'id_area' })
    area: Area;

    @OneToMany(() => Asesor, asesor => asesor.area)
    asesor: Asesor[];
}