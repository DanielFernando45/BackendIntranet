import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import * as B2 from 'backblaze-b2';
import { DataSource } from 'typeorm';
import { DIRECTORIOS } from './directorios.enum';
import { Readable } from 'stream';

@Injectable()
export class BackbazeService {
  private b2: any;
  private isAuthorized = false;
  private readonly bucketId = process.env.BUCKET_ID;
  private readonly bucketName = process.env.BUCKET_NAME;

  constructor() {
    this.b2 = new B2({
      applicationKeyId: process.env.B2_KEY_ID,
      applicationKey: process.env.B2_APP_KEY,
    });
  }

  private async ensureAuthorized() {
    if (!this.isAuthorized) {
      await this.b2.authorize();
      this.isAuthorized = true;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: DIRECTORIOS,
    customName?: string,
  ): Promise<string> {
    await this.ensureAuthorized();

    const uploadUrlResponse = await this.b2.getUploadUrl({
      bucketId: this.bucketId,
    });
    const { uploadUrl, authorizationToken } = uploadUrlResponse.data;

    try {
      const response = await this.b2.uploadFile({
        uploadUrl,
        uploadAuthToken: authorizationToken,
        fileName: `${folder}/${Date.now()}-${customName ? customName : file.originalname}`,
        data: file.buffer,
        mime: file.mimetype,
      });

      return response.data.fileName;
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al subir el archivo ${file.originalname}`,
      );
    }
  }

  async getSignedUrl(fileName: string, validSeconds = 3600): Promise<string> {
    await this.ensureAuthorized();

    const authResponse = await this.b2.authorize();
    const downloadUrl = authResponse.data.downloadUrl;

    const { data } = await this.b2.getDownloadAuthorization({
      bucketId: this.bucketId,
      fileNamePrefix: fileName,
      validDurationInSeconds: validSeconds,
    });

    const baseUrl = `${downloadUrl}/file/${this.bucketName}/${fileName}`;
    return `${baseUrl}?Authorization=${data.authorizationToken}`;
  }

  async deleteFile(fileName: string): Promise<boolean> {
    await this.ensureAuthorized();

    try {
      const { data } = await this.b2.listFileNames({
        bucketId: this.bucketId,
        prefix: fileName,
        maxFileCount: 1,
      });

      const file = data.files[0];

      if (!file) {
        console.warn(`Archivo no encontrado en B2: ${fileName}`);
        return false; // No se encontró el archivo
      }

      await this.b2.deleteFileVersion({
        fileName: file.fileName,
        fileId: file.fileId,
      });

      return true; // Eliminado correctamente
    } catch (err) {
      console.error(`Error al eliminar archivo ${fileName}:`, err);
      return false; // Error durante la eliminación
    }
  }

  async downloadFileByName(
    fileName: string,
  ): Promise<{ buffer: Buffer; mimeType: string }> {
    await this.ensureAuthorized();

    try {
      const result = await this.b2.downloadFileByName({
        bucketName: this.bucketName,
        fileName,
      });

      const mimeType = result.headers['content-type'];
      const chunks: Buffer[] = [];

      if (!(result.data instanceof Readable)) {
        throw new Error(
          `No es un stream válido: ${JSON.stringify(result.data)}`,
        );
      }

      for await (const chunk of result.data) {
        chunks.push(chunk);
      }

      return {
        buffer: Buffer.concat(chunks),
        mimeType,
      };
    } catch (error) {
      console.error('[Backblaze] Error al descargar archivo:', {
        mensaje: error.message,
      });
      throw error;
    }
  }

  async listFiles(prefix = 'inducciones') {
    await this.ensureAuthorized();

    const result = await this.b2.listFileNames({
      bucketId: this.bucketId,
      prefix: `${DIRECTORIOS.INDUCCIONES}/`,
      maxFileCount: 100,
    });

    console.log(
      '[Backblaze] Archivos encontrados:',
      result.data.files.map((f) => f.fileName),
    );
  }
}
