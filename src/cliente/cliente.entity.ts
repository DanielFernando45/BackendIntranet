import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from 'src/usuario/usuario.entity';
import { GradoAcademico } from 'src/common/entidades/gradoAcademico.entity';
import { Asesoramiento } from 'src/asesoramiento/entities/asesoramiento.entity';
import { ProcesosAsesoria } from 'src/procesos_asesoria/entities/procesos_asesoria.entity';

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dni: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  telefono: number;

  @Column()
  email: string;

  @Column({ nullable: true })
  url_imagen: string;

  @Column()
  pais: string;

  @ManyToOne(() => GradoAcademico)
  @JoinColumn({ name: 'id_grado_academico' })
  gradoAcademico: GradoAcademico;

  @Column()
  universidad: string;

  @CreateDateColumn()
  fecha_creacion: Date;

  @Column()
  carrera: string;

  @OneToOne(() => Usuario, { cascade: true })
  @JoinColumn()
  usuario: Usuario;

  @OneToMany(
    () => ProcesosAsesoria,
    (procesosAsesoria) => procesosAsesoria.cliente,
  )
  procesosAsesoria: ProcesosAsesoria[];

  // 🔹 Lado inverso de la relación ManyToMany con Asesoramiento
  @ManyToMany(() => Asesoramiento, (asesoramiento) => asesoramiento.clientes)
  asesoramientos: Asesoramiento[];
}
