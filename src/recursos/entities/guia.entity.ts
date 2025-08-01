import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Guia{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    titulo:string;

    @Column()
    descripcion:string;

    @Column()
    url_imagen:string;

    @Column()
    doc_url:string;
}