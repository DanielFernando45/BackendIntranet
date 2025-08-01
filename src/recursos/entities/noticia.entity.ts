import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Noticia{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    titulo:string;

    @Column()
    descripcion:string;

    @Column()
    url_imagen:string
}