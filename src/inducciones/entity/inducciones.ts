import { IsNotEmpty } from 'class-validator';
import { Asesoramiento } from 'src/asesoramiento/entities/asesoramiento.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';


@Entity('inducciones')
export class Inducciones {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  capitulo: string;

  @Column()
  url: string;

  @ManyToOne(() => Asesoramiento, { nullable: false })
  @JoinColumn({ name: 'id_asesoramiento' })
  asesoramiento: Asesoramiento;
}
