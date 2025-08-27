import { Entity, PrimaryGeneratedColumn, Column, OneToOne,JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Usuario } from "src/usuario/usuario.entity";
import { GradoAcademico } from "src/common/entidades/gradoAcademico.entity";
import { AreaAsesor } from "src/common/entidades/areaAsesor.entity";
import { ProcesosAsesoria } from "src/procesos_asesoria/entities/procesos_asesoria.entity";
import { Area } from "src/area/entities/area.entity";
import { Supervisor } from "src/supervisor/entities/supervisor.entity";

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

    @Column()
    universidad:string;
    
    // @ManyToOne(() => AreaAsesor)
    // @JoinColumn({ name: 'id_area' })
    // areaAsesor: AreaAsesor;

    @Column()
    especialidad:string;

    @ManyToOne(() => GradoAcademico)
    @JoinColumn({ name: 'id_grado_academico' }) // nombre de la columna en la tabla Cliente
    gradoAcademico: GradoAcademico;

    @ManyToOne( () => Supervisor)
    @JoinColumn({ name: 'id_supervisor' })
    supervisor: Supervisor;
    
    @OneToMany(() => Area, area => area.asesor)
    @JoinColumn({ name: 'id_area' })
    area: Area;

    @OneToOne(()=>Usuario,{cascade:true})
    @JoinColumn()
    usuario:Usuario;

    @OneToMany(()=>ProcesosAsesoria,procesosAsesoria=>procesosAsesoria.asesor)
    procesosAsesoria:ProcesosAsesoria[]
}