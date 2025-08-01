import { Entity,PrimaryGeneratedColumn, Column, OneToOne,JoinColumn, OneToMany, ManyToOne, CreateDateColumn} from "typeorm";
import { Usuario } from "src/usuario/usuario.entity";
import { TipoContrato } from "src/common/entidades/tipoContrato.entity";
import { GradoAcademico } from "src/common/entidades/gradoAcademico.entity";
import { TipoTrabajo } from "src/common/entidades/tipoTrabajo.entity";
import { Asesoramiento } from "src/asesoramiento/entities/asesoramiento.entity";
import { ProcesosAsesoria } from "src/procesos_asesoria/entities/procesos_asesoria.entity";
import { IsNotEmpty } from "class-validator";

@Entity()
export class Cliente{
    @PrimaryGeneratedColumn()
    id:number;
    
    @Column()
    dni:string;

    @Column()
    nombre:string;

    @Column()
    apellido:string;

    @Column()
    telefono:number;

    @Column()
    email:string;

    @Column()
    url_imagen:string;
    
    @Column()
    pais:string;
    
    @ManyToOne(() => GradoAcademico)
    @JoinColumn({ name: 'id_grado_academico' }) // nombre de la columna en la tabla Cliente
    gradoAcademico: GradoAcademico;
    
    // @ManyToOne(() => TipoTrabajo)
    // @JoinColumn({ name: 'id_tipo_trabajo' }) // nombre de la columna en la tabla Cliente
    // tipoTrabajo: TipoTrabajo;

    @Column()
    universidad:string;

    @CreateDateColumn()
    fecha_creacion:Date;

    @Column()
    carrera:string;

    // @ManyToOne(() => TipoContrato)
    // @JoinColumn({ name: 'id_contrato' }) // nombre de la columna en la tabla Cliente
    // tipoContrato: TipoContrato;

    @OneToOne(()=>Usuario,{cascade:true})
    @JoinColumn()
    usuario:Usuario;

    @OneToMany(()=>ProcesosAsesoria,procesosAsesoria=>procesosAsesoria.cliente)
    procesosAsesoria:ProcesosAsesoria[]
}