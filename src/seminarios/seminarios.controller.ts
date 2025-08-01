import { Body, Controller, Get, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { SeminariosService } from './seminarios.service';
import { CargarSeminarioDto } from './dto/cargar-semintario.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('seminarios')
export class SeminarioController {

    constructor(private readonly seminariosService: SeminariosService) { }

    @Post('')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'seminarioVideo', maxCount: 1 }
    ]))
    async cargarSeminario(@UploadedFiles() files: {
        seminarioVideo: Express.Multer.File[];
    }, @Body() body: CargarSeminarioDto) {
        return this.seminariosService.cargarSeminario(files, body);
    }

    @Get('')
    // @Get(':nombreArchivo')
    async obtenerVideosSeminario() {

        return this.seminariosService.obtenerVideosSeminario();
    }
}
