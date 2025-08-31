import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { SupervisorService } from './supervisor.service';

@Controller('supervisor')
export class SupervisorController {
  constructor(private readonly supervisorService: SupervisorService) {
  }

  @Get('asesor-by-area/:id')
  getAreaBySupervisor(@Param('id', ParseUUIDPipe) id: string) {
    return this.supervisorService.getAreaBySupervisor(id);
  }

}
