import { Injectable } from "@nestjs/common";
import { ZoomAuthService } from "./zoom.auth.service";
import axios from "axios";

@Injectable()
export class ZoomMeetingService{
    constructor(){}

    private generateMeetingPassword(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async createMeeting(userEmail:string,topic:string,startTime:string,token:string){
        try{
        const res=await axios.post(
            `https://api.zoom.us/v2/users/${userEmail}/meetings`,
            {
                topic,
                type:2,
                start_time:startTime,
                duration:60,
                timezone:'America/Lima',
                password: this.generateMeetingPassword(), 
                settings:{
                    waiting_room: false,
                    meeting_authentication: false,
                    //authentication_option: "", // Vacío para evitar autenticación
                    approval_type: 2, // No requiere aprobación
                    //close_registration: true, // Cierra registro
                    // ↓↓↓ Nuevo parámetro crítico ↓↓↓
                    enforce_login: false, // Permite acceso sin cuenta Zoom
                    join_before_host: true, // Permite unión sin anfitrión
                    registrants_email_notification: false,
                    encryption_type: 'enhanced_encryption',
                    alternative_hosts: '',
                    show_share_button: false,
                    allow_multiple_devices: true,
                    auto_recording: "none", // Grabar puede forzar registro
                    recording: 'cloud',
                    contact_email: "", // Elimina correo de contacto
                    contact_name: "", // Elimina nombre de contacto
                }
            },
            {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }
        )
        console.log(res)
        return res.data
    }catch(err){
        console.error('Error creando el zoom:',err)
        throw err
    }   
    }


}