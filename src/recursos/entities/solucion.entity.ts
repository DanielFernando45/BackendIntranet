import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Solucion{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    preguntas:string;

    @Column()
    respuestas:string
}