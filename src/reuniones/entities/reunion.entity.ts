import { Asesoramiento } from "src/asesoramiento/entities/asesoramiento.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

export enum Estado_reunion{
    ESPERA="espera",
    TERMINADO="terminado"
}

@Entity()
export class Reunion {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    titulo:string;

    @Column({ type: 'timestamp' })
    fecha_reunion: Date;

    @Column({ type: 'enum', enum: Estado_reunion, default: 'espera' })
    estado: Estado_reunion;

    @Column({ nullable: true })
    enlace_zoom: string;

    @Column({ nullable:true })
    zoom_password:string;

    @Column({ nullable: true })
    enlace_video: string;

    @Column({nullable:true})
    video_password:string;

    @Column({ nullable: true })
    meetingId: string;
    
    @Column()
    zoomUuid:string;
    
    @Column({ type: 'timestamp' })
    fecha_creacion:Date;
    
    @ManyToOne(() => Asesoramiento)
    @JoinColumn({name:"id_asesoramiento"})
    asesoramiento: Asesoramiento;

}
