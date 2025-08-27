import { Asesor } from "src/asesor/asesor.entity";
import { Rol } from "src/rol/entities/rol.entity";
import { Supervisor } from "src/supervisor/entities/supervisor.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class Area {

    @PrimaryColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @ManyToOne( () => Rol)
    @JoinColumn({ name: 'id_rol' })
    rol: Rol;

    @OneToMany(() => Supervisor, supervisor => supervisor.area)
    supervisor: Supervisor[];

    @OneToMany(() => Asesor, asesor => asesor.area)
    asesor: Asesor[];
}
