import { Injectable, BadRequestException } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { join, extname, dirname } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class VideoCompressionService {
  async compressVideo(filePath: string): Promise<string> {
    try {
      if (!filePath) throw new BadRequestException('Ruta de archivo inválida');

      // ✅ Asegurar que ffmpeg use la ruta correcta
      const ffmpegBinary = ffmpegStatic || '/usr/bin/ffmpeg';
      ffmpeg.setFfmpegPath(ffmpegBinary);
      console.log('🎯 ffmpeg path set to:', ffmpegBinary);

      const dir = dirname(filePath);
      const tempOutput = join(dir, `compressed-temp-${Date.now()}.mp4`);

      console.log(`🎬 Iniciando compresión de: ${filePath}`);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(filePath)
          .outputOptions([
            '-vcodec libx264',
            '-crf 28',
            '-preset veryfast',
            '-movflags +faststart',
          ])
          .on('end', () => {
            console.log('✅ Compresión completada:', tempOutput);
            resolve();
          })
          .on('error', (err: Error) => {
            console.error('❌ Error al comprimir video:', err.message);
            reject(new BadRequestException('No se pudo comprimir el video'));
          })
          .save(tempOutput);
      });

      // ✅ Reemplazar el archivo original
      await fs.unlink(filePath);
      await fs.rename(tempOutput, filePath);

      console.log('📦 Archivo reemplazado por la versión comprimida');
      return filePath;
    } catch (error) {
      console.error('❌ Error crítico en compresión:', error);
      throw new BadRequestException('No se pudo comprimir el video');
    }
  }
}
