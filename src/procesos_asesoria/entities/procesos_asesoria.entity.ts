import { Asesor } from 'src/asesor/asesor.entity';
import { Asesoramiento } from 'src/asesoramiento/entities/asesoramiento.entity';
import { Cliente } from 'src/cliente/cliente.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ProcesosAsesoria {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;

  @ManyToOne(() => Asesor)
  @JoinColumn({ name: 'id_asesor' })
  asesor: Asesor;

  @ManyToOne(() => Asesoramiento)
  @JoinColumn({ name: 'id_asesoramiento' }) // nombre de la columna en la tabla Cliente
  asesoramiento: Asesoramiento;

  @Column({ type: 'boolean', default: false })
  esDelegado: boolean;
}
