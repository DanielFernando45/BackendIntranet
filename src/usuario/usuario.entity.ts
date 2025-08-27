import { Admin } from 'src/admin/admin.entity';
import { Asesor } from 'src/asesor/asesor.entity';
import { Cliente } from 'src/cliente/cliente.entity';
import { Rol } from 'src/rol/entities/rol.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';

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

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  estado: boolean;

  // @Column({ type: 'enum', enum: UserRole })
  // role: UserRole;
  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'id_rol' })
  rol: Rol;

  @OneToOne(() => Asesor, asesor => asesor.usuario)
  asesor: Asesor;

  @OneToOne(() => Admin, admin => admin.usuario)
  admin: Admin;

  @OneToOne(() => Cliente, cliente => cliente.usuario)
  cliente: Cliente;

}