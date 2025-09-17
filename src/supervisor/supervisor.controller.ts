import { Controller, Post, Body, Param, Put, Get, Delete, Patch } from '@nestjs/common';
import { SupervisorService } from './supervisor.service';
import { createSupervisorDto } from './dto/crear-supervisor.dto';

@Controller('supervisor')
export class SupervisorController {
    constructor(private readonly supervisorService: SupervisorService) {}

    @Post('add')
    async create(@Body() createSupervisorDto: createSupervisorDto) {
        return this.supervisorService.createSupervisor(createSupervisorDto);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() data: Partial<createSupervisorDto>
    ) {
        return this.supervisorService.updateSupervisor(id, data);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.supervisorService.deleteSupervisor(id);
    }

    @Put('asignar-areas/:id')
    async assignAreas(
        @Param('id') id: string,
        @Body('areasIds') areasIds: string[]
    ) {
        return this.supervisorService.assignAreasToSupervisor(id, areasIds);
    }

    @Patch('quitar-areasAsesor/:id')
    async unassignAreas(
        @Param('id') id: string,
        @Body('areasIds') areasIds: string[]
    ) {
        return this.supervisorService.unassignAreasFromSupervisor(id, areasIds);
    }

    @Get('areas/:id')
    async getAreas(@Param('id') id: string) {
        return this.supervisorService.getAreasBySupervisor(id);
    }

    @Get(':id')
    async getSupervisor(@Param('id') id: string) {
        return this.supervisorService.getSupervisorWithAreas(id);
    }
}