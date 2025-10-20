import { Module } from '@nestjs/common';
import { BackbazeService } from './backblaze.service';
import { BackblazeController } from './backblaze.controller';

@Module({
  controllers: [BackblazeController],  // 👈 FALTA ESTO
  providers: [BackbazeService],
  exports: [BackbazeService],
})
export class BackblazeModule {}
