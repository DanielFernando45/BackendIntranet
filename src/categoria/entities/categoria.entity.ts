import { Contrato } from "src/contrato/entities/contrato.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum CategoriasTag {
    BRONCE = 'bronce',
    PLATA = 'plata',
    ORO = 'oro',
}


@Entity()
export class Categoria {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'enum', enum: CategoriasTag })
    descripcion: string;

    // El OneToMany no se refleja en la tabla, sirve para enlanzar o hacer el JOIN con los registros relacionados a la tabbla
    // En otras palabras cuando yo quiera una entidad y todos las entidades relacionadas a esta lo hara mendiante el OneToMany
    @OneToMany(() => Contrato, contrato => contrato.categoria)
    contratos: Contrato[];
}
