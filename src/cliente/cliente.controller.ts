import { Body, Controller, UsePipes, ValidationPipe,Post, Get, Param, ParseIntPipe, Patch, Delete, UseGuards } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/crear-cliente.dto';
import { updateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('cliente')
export class ClienteController {
    constructor(private readonly clienteService:ClienteService){}

    @Get(':id')
    async listOne(@Param('id',ParseIntPipe) id:number){
        return this.clienteService.listOneClient(id)
    }

    @Get('listar/:id')
    async listAllByAsesoramiento(@Param('id', ParseIntPipe) id: number){
        return this.clienteService.listAllByAsesoramiento(id);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async listAll(){
        return this.clienteService.listClients();
    }
    @Get("filter/all")
    async listAllAsignar(){
        return this.clienteService.listarClientesAsignar()
    }

    @Post("/add")
    @UsePipes(new ValidationPipe({transform:true}))
    async crearCliente(@Body() createClienteDto:CreateClienteDto){
        return this.clienteService.crearCliente(createClienteDto)
    }

    @Patch('/update/:id')
    async update(@Param('id',ParseIntPipe) id:number,@Body() body:updateClienteDto){
        return this.clienteService.patchCliente(id,body)
    }

    @Patch('updated_cliente/:id')
    async updateByClient(@Param('id',ParseIntPipe) id:number,@Body() body:updateClienteDto){
        return this.clienteService.patchByClient(id,body)
    }

    @Delete('delete/:id')
    async delete(@Param('id',ParseIntPipe) id:number){
        return this.clienteService.deletedCliente(id)
    }

    @Get('filter/sin_asignar')
    async getClientesSinAsignar(){
        return this.clienteService.clientesSinAsignar()
    }

    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles("admin")
    @Patch("desactivate/:id")
    async desactivate(@Param('id',ParseIntPipe) id:number){
        return this.clienteService.desactivateCliente(id)
    }

    @Get('miAsesoramiento/:id')
    async getAsesoramientos(@Param('id',ParseIntPipe) id:number){
        return this.clienteService.getAsesorias(id)
    }
    @Get("misContratos/:id")
    async getContratos(@Param('id',ParseIntPipe) id:number){
        return this.clienteService.getContratos(id)
    }

    @Get('idClienteByAsesoramiento/:id')
    async idDelegado(@Param('id',ParseIntPipe) id:number){
        return this.clienteService.getDelegado(id)
    }

}
