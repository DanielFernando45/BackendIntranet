import { Controller, Post, Body, Param, Put, Get } from '@nestjs/common';
import { SupervisorService } from './supervisor.service';
import { createSupervisorDto } from './dto/crear-supervisor.dto';

@Controller('supervisor')
export class SupervisorController {
    constructor(private readonly supervisorService: SupervisorService) {}

    @Post('add')
    async create(@Body() createSupervisorDto: createSupervisorDto) {
        return this.supervisorService.createSupervisor(createSupervisorDto);
    }

    @Put(':id/asignar-areas')
    async assignAreas(
        @Param('id') id: string,
        @Body('areasIds') areasIds: string[]
    ) {
        return this.supervisorService.assignAreasToSupervisor(id, areasIds);
    }

    @Put(':id/quitar-areasAsesor')
    async unassignAreas(
        @Param('id') id: string,
        @Body('areasIds') areasIds: string[]
    ) {
        return this.supervisorService.unassignAreasFromSupervisor(id, areasIds);
    }

    @Get('areas/:id')
    async getAreas(@Param('id') id: string) {
        return this.supervisorService.getAreaBySupervisor(id);
    }

    @Get(':id')
    async getSupervisor(@Param('id') id: string) {
        return this.supervisorService.getSupervisorWithAreas(id);
    }
}