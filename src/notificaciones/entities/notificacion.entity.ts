import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cliente } from 'src/cliente/cliente.entity';
import { Contrato } from 'src/contrato/entities/contrato.entity';
import { Asesor } from 'src/asesor/asesor.entity';

@Entity({ name: 'notificaciones' })
export class Notificacion {
  @PrimaryGeneratedColumn()
  id: number;

  // Emisores
  @ManyToOne(() => Cliente, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cliente_emisor' })
  clienteEmisor?: Cliente | null;

  @ManyToOne(() => Asesor, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_asesor_emisor' })
  asesorEmisor?: Asesor | null;

  // Receptores
  @ManyToOne(() => Cliente, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cliente_receptor' })
  clienteReceptor?: Cliente | null;

  @ManyToOne(() => Asesor, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_asesor_receptor' })
  asesorReceptor?: Asesor | null;

  // Contrato asociado (opcional)
  @ManyToOne(() => Contrato, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_contrato' })
  contrato?: Contrato | null;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ type: 'varchar', length: 50 })
  tipo: string; // avance, revision, vencimiento, etc.

  @Column({ type: 'boolean', default: false })
  leida: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  vence_en: Date | null;
}
