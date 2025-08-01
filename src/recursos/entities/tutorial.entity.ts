import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Tutorial{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    titulo:string;

    @Column()
    enlace:string
}