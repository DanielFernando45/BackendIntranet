// src/tipo-pago/tipo-pago.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipo_pago')
export class TipoPago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  
}
