import { Module } from '@nestjs/common';
import { SeminariosService } from './seminarios.service';
import { SeminarioController } from './seminarios.controller';
import { BackblazeModule } from 'src/backblaze/backblaze.module';

@Module({
  imports: [BackblazeModule],
  providers: [SeminariosService],
  controllers: [SeminarioController]
})
export class SeminariosModule {}
