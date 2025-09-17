import { Asesor } from "src/asesor/asesor.entity";
import { Supervisor } from "src/supervisor/entities/supervisor.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class Area {

    @PrimaryColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @ManyToOne(() => Supervisor, supervisor => supervisor.areas)
    @JoinColumn({ name: 'id_supervisor' })
    supervisor: Supervisor | null;

    @OneToMany(() => Asesor, asesor => asesor.area)
    asesor: Asesor[];
}
