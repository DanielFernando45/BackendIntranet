import { Asesoramiento } from 'src/asesoramiento/entities/asesoramiento.entity';
import { Documento } from 'src/documentos/entities/documento.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum Estado_asunto {
  ENTREGADO = 'entregado',
  PROCESO = 'proceso',
  TERMINADO = 'terminado',
}

@Entity()
export class Asunto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column({ type: 'enum', enum: Estado_asunto })
  estado: Estado_asunto;

  @Column()
  fecha_entregado: Date;

  @Column({ nullable: true })
  fecha_revision: Date;

  @Column({ nullable: true })
  fecha_terminado: Date;

  @ManyToOne(() => Asesoramiento)
  @JoinColumn({ name: 'id_asesoramiento' })
  asesoramiento: Asesoramiento;

  @OneToMany(() => Documento, (documento) => documento.asunto)
  documentos: Documento[];
}
