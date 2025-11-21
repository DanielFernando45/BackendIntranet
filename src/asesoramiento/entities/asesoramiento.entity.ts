import { TipoContrato } from 'src/common/entidades/tipoContrato.entity';
import { TipoTrabajo } from 'src/common/entidades/tipoTrabajo.entity';
import { Informacion_Pagos } from 'src/pagos/entities/informacion_pagos.entity';
import { Contrato } from 'src/contrato/entities/contrato.entity';
import { ProcesosAsesoria } from 'src/procesos_asesoria/entities/procesos_asesoria.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cliente } from 'src/cliente/cliente.entity';
import { Usuario } from 'src/usuario/usuario.entity'; // o Asesor, según tu estructura
import { Asesor } from 'src/asesor/asesor.entity';
import { AsesoramientoDocumento } from 'src/asesoramiento-documento/entity/asesoramiento-documento.entity';
export enum Estado_Asesoria {
  ACTIVO = 'activo',
  DESACTIVADO = 'desactivado',
  FINALIZADO = 'finalizado',
}

export enum Tipo_Servicio {
  PROYECTO = 'proyecto',
  INFORME_FINAL = 'informe_final',
  COMPLETO = 'completo',
}

@Entity()
export class Asesoramiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  profesion_asesoria: string;

  @Column({ type: 'enum', enum: Estado_Asesoria })
  estado: Estado_Asesoria;

  @OneToOne(() => Contrato, (contrato) => contrato.asesoramiento)
  contrato: Contrato;

  // 🔹 Relación 1:N con procesos
  @OneToMany(
    () => ProcesosAsesoria,
    (procesosasesoria) => procesosasesoria.asesoramiento,
  )
  procesosasesoria: ProcesosAsesoria[];

  // 🔹 Relación N:M con clientes (a través de procesos_asesoria)
  @ManyToMany(() => Cliente, (cliente) => cliente.asesoramientos)
  @JoinTable({
    name: 'procesos_asesoria',
    joinColumn: { name: 'id_asesoramiento', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'id_cliente', referencedColumnName: 'id' },
  })
  clientes: Cliente[];

  // 🔹 Relación N:M con asesores (también a través de procesos_asesoria)
  @ManyToMany(() => Asesor, (asesor) => asesor.asesoramientos)
  @JoinTable({
    name: 'procesos_asesoria',
    joinColumn: { name: 'id_asesoramiento', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'id_asesor', referencedColumnName: 'id' },
  })
  asesores: Asesor[];

  // 🔹 Relación 1:N con pagos
  @OneToMany(
    () => Informacion_Pagos,
    (informacion_pago) => informacion_pago.asesoramiento,
  )
  informacion_pago: Informacion_Pagos[];

  @OneToMany(() => AsesoramientoDocumento, (doc) => doc.asesoramiento)
  documentos: AsesoramientoDocumento[];
}
