import { Controller, Get } from '@nestjs/common';
import { BackbazeService } from './backblaze.service';

@Controller('backblaze')
export class BackblazeController {
  constructor(private readonly backblazeService: BackbazeService) {}

  @Get('upload-url')
  async getUploadUrl() {
    return await this.backblazeService.getUploadUrl();
  }

  
}
