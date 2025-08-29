import {Entity,PrimaryGeneratedColumn,Column,OneToOne,JoinColumn, ManyToOne} from 'typeorm'
import {Usuario} from '../usuario/usuario.entity'
import { AreaAsesor } from 'src/common/entidades/areaAsesor.entity';
import { Area } from 'src/area/entities/area.entity';

@Entity()
export class Admin{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    nombre:string;

    @Column()
    email:string;

    @Column()
    dni:string;

    @OneToOne(()=>Usuario,{cascade:true})
    @JoinColumn()
    usuario:Usuario;

    @ManyToOne(() => Area)
    @JoinColumn({ name: 'id_area' }) 
    area: Area;
}