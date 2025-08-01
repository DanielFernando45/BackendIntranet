import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SoportesService } from './soportes.service';
import { CreateSoporteDto } from './dto/create-soporte.dto';
import { UpdateSoporteDto } from './dto/update-soporte.dto';
import { AsuntoEstado } from './entities/soporte.entity';

@Controller('soporte')
export class SoportesController {
  constructor(private readonly soportesService: SoportesService) {}

  @Post('add')
  create(@Body() createSoporteDto: CreateSoporteDto) {
    return this.soportesService.create(createSoporteDto);
  }

  @Get(':estado')
  findAll(@Param('estado') estado:AsuntoEstado){
    return this.soportesService.findByEstado(estado);
  }

  @Get('list/:id')
  findOne(@Param('id') id: string) {
    return this.soportesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSoporteDto: UpdateSoporteDto) {
    return this.soportesService.update(+id, updateSoporteDto);
  }

  @Patch('finish/:id')
  finished(@Param('id',ParseIntPipe) id:number){
    return this.soportesService.changeToFinished(id)
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.soportesService.remove(+id);
  }
}
