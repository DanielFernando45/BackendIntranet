import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Asesoramiento } from 'src/asesoramiento/entities/asesoramiento.entity';
import { AsesoramientoDocumentoArchivo } from './asesoramiento-documento-archivo.entity';

@Entity('asesoramiento_documentos')
export class AsesoramientoDocumento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  asesoramiento_id: number;

  @Column()
  titulo: string;

  @Column({ type: 'date' })
  fecha: string;

  @ManyToOne(() => Asesoramiento, (a) => a.documentos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asesoramiento_id' })
  asesoramiento: Asesoramiento;

  @OneToMany(
    () => AsesoramientoDocumentoArchivo,
    (archivo) => archivo.documento,
    { cascade: true },
  )
  archivos: AsesoramientoDocumentoArchivo[];
}
