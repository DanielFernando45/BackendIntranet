import { Asesoramiento } from "src/asesoramiento/entities/asesoramiento.entity";
import { Categoria } from "src/categoria/entities/categoria.entity";
import { TipoContrato } from "src/common/entidades/tipoContrato.entity";
import { TipoPago } from "src/common/entidades/tipoPago.entity";
import { TipoTrabajo } from "src/common/entidades/tipoTrabajo.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('contrato')
export class Contrato {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    servicio: string

    // @Column()
    // estado: string

    @Column()
    modalidad: string

    @CreateDateColumn({ type: 'timestamp' })
    fecha_inicio: Date

    @CreateDateColumn({ type: 'timestamp' })
    fecha_fin: Date

    @ManyToOne( () => Asesoramiento)
    @JoinColumn({ name: 'id_asesoramiento' })
    asesoramiento: Asesoramiento

    @ManyToOne( () => TipoTrabajo)
    @JoinColumn({ name: 'id_tipoTrabajo' })
    tipoTrabajo: TipoTrabajo

    
    @ManyToOne( () => TipoPago)
    @JoinColumn({ name: 'id_tipoPago' })
    tipoPago: TipoPago

    @ManyToOne( () => Categoria)
    @JoinColumn({ name: 'id_categoria' })
    categoria: Categoria
}