import { Area } from "src/area/entities/area.entity";
import { Usuario } from "src/usuario/usuario.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

export enum UserRole {
  ADMIN = 'admin',
  ASESOR = 'asesor',
  ESTUDIANTE = 'estudiante',
  JEFE_OPERACIONES = 'jefe_operaciones',
  SUPERVISOR = 'supervisor',
  CONTRATO_PAGO = 'contrato_pago',
  ASESOR_INDUCCIONES = 'asesor_inducciones',
  SOPORTE = 'soporte',
  MARKETING = 'marketing',
}
@Entity()
export class Rol {

    @PrimaryColumn('uuid')
    id: string;

    // @Column()
    @Column({ type: 'enum', enum: UserRole })
    nombre: string;

    @OneToMany(() => Area, area => area.rol)
    area: Area[];

    @OneToMany(() => Usuario, usuario => usuario.rol)
    usuario: Usuario[];
    
}
