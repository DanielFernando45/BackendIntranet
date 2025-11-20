import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsesoramientoDocumento } from './entity/asesoramiento-documento.entity';
import { CreateAsesoramientoDocumentoDto } from './dto/create-asesoramiento-documento.dto';
import { UpdateAsesoramientoDocumentoDto } from './dto/update-asesoramiento-documento.dto';
import { BackbazeService } from 'src/backblaze/backblaze.service';
import { DIRECTORIOS } from 'src/backblaze/directorios.enum';
import { AsesoramientoDocumentoArchivo } from './entity/asesoramiento-documento-archivo.entity';

@Injectable()
export class AsesoramientoDocumentoService {
  constructor(
    private readonly backblazeService: BackbazeService,

    @InjectRepository(AsesoramientoDocumento)
    private repo: Repository<AsesoramientoDocumento>,
    @InjectRepository(AsesoramientoDocumentoArchivo)
    private archivoRepo: Repository<AsesoramientoDocumentoArchivo>,
  ) {}

  async create(
    asesoramientoId: number,
    data: CreateAsesoramientoDocumentoDto,
    files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new InternalServerErrorException(
        'Debe adjuntar al menos un archivo',
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // 1. Crear documento padre
    const documento = this.repo.create({
      titulo: data.titulo,
      asesoramiento_id: asesoramientoId,
      fecha: today,
    });

    const savedDocument = await this.repo.save(documento);

    // 2. Subir archivos y crear registros en tabla hija
    savedDocument.archivos = [];

    for (const file of files) {
      const fileName = await this.backblazeService.uploadFile(
        file,
        DIRECTORIOS.DOCUMENTOS,
      );

      savedDocument.archivos.push({
        documento_id: savedDocument.id,
        url: fileName,
      } as any);
    }

    // Guardar archivos (gracias al cascade)
    await this.repo.save(savedDocument);

    return savedDocument;
  }

  async findAll(asesoramientoId: number) {
    const documentos = await this.repo.find({
      where: { asesoramiento_id: asesoramientoId },
      relations: ['archivos'],
    });

    // Generar signedUrl para cada archivo
    for (const doc of documentos) {
      for (const archivo of doc.archivos) {
        archivo['signedUrl'] = await this.backblazeService.getSignedUrl(
          archivo.url,
        );
      }
    }

    return documentos;
  }

  async findOne(id: number) {
    const documento = await this.repo.findOne({
      where: { id },
      relations: ['archivos', 'asesoramiento'],
    });

    if (!documento) throw new NotFoundException('Documento no encontrado');

    for (const archivo of documento.archivos) {
      archivo['signedUrl'] = await this.backblazeService.getSignedUrl(
        archivo.url,
      );
    }

    return documento;
  }

  async update(
    id: number,
    changes: UpdateAsesoramientoDocumentoDto,
    files?: Express.Multer.File[],
  ) {
    const documento = await this.repo.findOne({
      where: { id },
      relations: ['archivos'],
    });

    if (!documento) throw new NotFoundException('Documento no encontrado');

    Object.assign(documento, changes);

    const archivosConservar = changes.archivosConservar || [];

    const archivosAEliminar = documento.archivos.filter(
      (a) => !archivosConservar.includes(a.id),
    );

    for (const archivo of archivosAEliminar) {
      await this.backblazeService.deleteFile(archivo.url);

      await this.archivoRepo.delete(archivo.id);
    }

    const archivosRestantes = await this.archivoRepo.find({
      where: { documento_id: documento.id },
    });

    documento.archivos = archivosRestantes;

    if (files && files.length > 0) {
      for (const file of files) {
        const fileName = await this.backblazeService.uploadFile(
          file,
          DIRECTORIOS.DOCUMENTOS,
        );

        const nuevo = this.archivoRepo.create({
          documento_id: documento.id,
          url: fileName,
        });

        await this.archivoRepo.save(nuevo);
        documento.archivos.push(nuevo);
      }
    }

    await this.repo.save(documento);

    return documento;
  }

  async remove(id: number) {
    const doc = await this.repo.findOne({
      where: { id },
      relations: ['archivos'],
    });

    if (!doc) throw new NotFoundException('Documento no encontrado');

    for (const archivo of doc.archivos) {
      await this.backblazeService.deleteFile(archivo.url);
    }

    return this.repo.remove(doc);
  }
}
