import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DateTime } from 'luxon';

@Injectable()
export class DateFormatInterceptor implements NestInterceptor {
  private readonly zone = 'America/Lima';
  private readonly locale = 'es-PE';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.formatDates(data)));
  }

  private formatDates(data: any): any {
    if (data === null || data === undefined) return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.formatDates(item));
    }

    if (typeof data === 'object' && !(data instanceof Date)) {
      const newObj: any = {};
      for (const key of Object.keys(data)) {
        newObj[key] = this.formatDates(data[key]);
      }
      return newObj;
    }

    // Si es fecha o string ISO → convierto
    if (data instanceof Date || this.isIsoString(data)) {
      const date = data instanceof Date ? data : new Date(data);

      return DateTime.fromJSDate(date)
        .setZone(this.zone) // 👈 siempre Lima
        .setLocale(this.locale)
        .toFormat('dd/MM/yyyy HH:mm'); // 👈 ya no devuelve ISO, sino local
    }

    return data;
  }

  private isIsoString(value: any): boolean {
    return (
      typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/.test(value)
    );
  }
}
