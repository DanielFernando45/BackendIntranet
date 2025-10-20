import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Usuario } from 'src/usuario/usuario.entity';
import { GradoAcademico } from 'src/common/entidades/gradoAcademico.entity';
import { ProcesosAsesoria } from 'src/procesos_asesoria/entities/procesos_asesoria.entity';
import { Area } from 'src/area/entities/area.entity';
import { Supervisor } from 'src/supervisor/entities/supervisor.entity';
import { Asesoramiento } from 'src/asesoramiento/entities/asesoramiento.entity';

@Entity()
export class Asesor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dni: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  email: string;

  @Column()
  telefono: number;

  @Column()
  url_imagen: string;

  @Column()
  universidad: string;

  @Column()
  especialidad: string;

  @ManyToOne(() => GradoAcademico)
  @JoinColumn({ name: 'id_grado_academico' })
  gradoAcademico: GradoAcademico;

  @ManyToOne(() => Area)
  @JoinColumn({ name: 'id_area' })
  area: Area;

  @OneToOne(() => Usuario, { cascade: true, eager: true })
  @JoinColumn()
  usuario: Usuario;

  // 🔹 Relación 1:N con ProcesosAsesoria
  @OneToMany(
    () => ProcesosAsesoria,
    (procesosAsesoria) => procesosAsesoria.asesor,
  )
  procesosAsesoria: ProcesosAsesoria[];

  // 🔹 Relación N:M con Asesoramiento (a través de procesos_asesoria)
  @ManyToMany(() => Asesoramiento, (asesoramiento) => asesoramiento.asesores)
  asesoramientos: Asesoramiento[];
}
