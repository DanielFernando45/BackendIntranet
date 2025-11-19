import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AsesoramientoDocumento } from './asesoramiento-documento.entity';

@Entity('asesoramiento_documento_archivos')
export class AsesoramientoDocumentoArchivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  documento_id: number;

  @Column()
  url: string;

  @ManyToOne(() => AsesoramientoDocumento, (d) => d.archivos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'documento_id' })
  documento: AsesoramientoDocumento;
}
