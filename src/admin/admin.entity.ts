import {Entity,PrimaryGeneratedColumn,Column,OneToOne,JoinColumn, ManyToOne} from 'typeorm'
import {Usuario} from '../usuario/usuario.entity'
import { AreaAsesor } from 'src/common/entidades/areaAsesor.entity';

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

    @ManyToOne(() => AreaAsesor)
    @JoinColumn({ name: 'id_area' }) 
    area: AreaAsesor;
}