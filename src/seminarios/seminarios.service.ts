import { BadRequestException, Injectable } from '@nestjs/common';
import { CargarSeminarioDto } from './dto/cargar-semintario.dto';
import { BackbazeService } from 'src/backblaze/backblaze.service';
import { DIRECTORIOS } from 'src/backblaze/directorios.enum';

@Injectable()
export class SeminariosService {

    constructor(
        private readonly backblazeService: BackbazeService, // Asegúrate de tener el servicio de Backblaze configurado
    ) { }


    async cargarSeminario(files: { seminarioVideo: Express.Multer.File[] }, body: CargarSeminarioDto) {
        const video = files.seminarioVideo?.[0];
        if (!video) throw new BadRequestException("No se envió el video");

        const videoUrl = await this.backblazeService.uploadFile(video, DIRECTORIOS.SEMINARIOS);

        // Aquí puedes guardar en la base de datos si lo necesitas
        // const newSeminario = this.seminariosRepo.create({ ...body, videoUrl });
        // await this.seminariosRepo.save(newSeminario);

        return {
            mensaje: "Seminario agregado satisfactoriamente",
            video_url: videoUrl,
        };
    }
    

    async obtenerVideosSeminario() {
        // Aquí deberías implementar la lógica para obtener los videos de seminarios desde tu base de datos
        // Por ejemplo, si tienes un repositorio de seminarios:
        // return this.seminariosRepo.find();
        const url = await this.backblazeService.getSignedUrl(`seminarios/1752009785811-clase-de-ramos.mp4`);
        return { videoUrl: url };

        // Para este ejemplo, simplemente retornamos un mensaje
        return {
            mensaje: "Aquí irían los videos de seminarios",
            // videos: await this.seminariosRepo.find(),
        };
    }
}