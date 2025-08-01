import { Module } from '@nestjs/common';
import { BackbazeService } from './backblaze.service';

@Module({
    exports:[BackbazeService],
    providers:[BackbazeService]
})
export class BackblazeModule {}
