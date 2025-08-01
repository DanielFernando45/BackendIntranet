import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Herramienta{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    nombre:string;

    @Column()
    descripcion:string;

    @Column()
    url_imagen:string;

    @Column()
    enlace:string
}