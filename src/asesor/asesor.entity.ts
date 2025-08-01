import { Entity, PrimaryGeneratedColumn, Column, OneToOne,JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Usuario } from "src/usuario/usuario.entity";
import { GradoAcademico } from "src/common/entidades/gradoAcademico.entity";
import { AreaAsesor } from "src/common/entidades/areaAsesor.entity";
import { ProcesosAsesoria } from "src/procesos_asesoria/entities/procesos_asesoria.entity";

@Entity()
export class Asesor{
    @PrimaryGeneratedColumn()
    id:number;
    
    @Column()
    dni:string;
    
    @Column()
    nombre:string;

    @Column()
    apellido:string;

    @Column()
    email:string;

    @Column()
    telefono:number;

    @Column()
    url_imagen:string;

    @ManyToOne(() => AreaAsesor)
    @JoinColumn({ name: 'id_area' }) // nombre de la columna en la tabla Cliente
    areaAsesor: AreaAsesor;

    @Column()
    especialidad:string;

    @ManyToOne(() => GradoAcademico)
    @JoinColumn({ name: 'id_grado_academico' }) // nombre de la columna en la tabla Cliente
    gradoAcademico: GradoAcademico;
    

    @Column()
    universidad:string;

    @OneToOne(()=>Usuario,{cascade:true})
    @JoinColumn()
    usuario:Usuario;

    @OneToMany(()=>ProcesosAsesoria,procesosAsesoria=>procesosAsesoria.asesor)
    procesosAsesoria:ProcesosAsesoria[]
}