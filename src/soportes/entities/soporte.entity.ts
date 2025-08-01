import { Cliente } from "src/cliente/cliente.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum AsuntoError{
    ENTREGA="Error_en_entrega_y_revision",
    REUNIONES="Error_en_reuniones",
    CALENDARIO="Error_en_calendario",
    RECURSOS="Error_en_recursos",
    OTRO="Otro"
}

export enum AsuntoEstado{
    ESPERA="espera",
    FINALIZADO="finalizado"
}

@Entity()
export class Soporte {
    @PrimaryGeneratedColumn()
    id:number;

    @Column({type:'enum',enum:AsuntoError})
    asunto:AsuntoError;

    @Column()
    descripcion:string;
    
    @Column({type:'enum',enum:AsuntoEstado,default:'espera'})
    estado:AsuntoEstado;
    
    @Column()
    fecha_envio:Date;

    @Column({nullable:true})
    fecha_revision:Date;

    @ManyToOne(()=>Cliente)
    @JoinColumn({name:"id_cliente"})
    cliente:Cliente;
}
