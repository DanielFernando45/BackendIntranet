import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ProcesosAsesoria } from 'src/procesos_asesoria/entities/procesos_asesoria.entity';
import { Asesor } from 'src/asesor/asesor.entity';

@Entity( 'auditoria_asesoria')
export class AuditoriaAsesoria {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProcesosAsesoria, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_proceso_asesoria' })
  procesoAsesoria: ProcesosAsesoria;

  @ManyToOne(() => Asesor, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'id_asesor' })
  asesor: Asesor;

  @Column({ length: 100 })
  tipo: string;

  @Column({ length: 150 })
  accion: string;

  @Column({ type: 'text' })
  descripcion: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @Column({ type: 'text', nullable: true })
  detalle: string;
}
