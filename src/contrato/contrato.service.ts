import { Injectable } from '@nestjs/common';
import { Asesoramiento } from 'src/asesoramiento/entities/asesoramiento.entity';
import { Repository } from 'typeorm';
import { Contrato } from './entities/contrato.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { NotFoundException } from '@nestjs/common';
import { TipoTrabajo } from 'src/common/entidades/tipoTrabajo.entity';
import { TipoPago } from 'src/common/entidades/tipoPago.entity';
import { Categoria } from 'src/categoria/entities/categoria.entity';
import { BadRequestException } from '@nestjs/common';
import { UpdateContratoDto } from './dto/update-contrato.dto';

@Injectable()
export class ContratoService {
  constructor(
    @InjectRepository(Contrato)
    private readonly contratoRepo: Repository<Contrato>,

    @InjectRepository(Asesoramiento)
    private readonly asesoramientoRepo: Repository<Asesoramiento>,

    @InjectRepository(TipoTrabajo)
    private readonly tipoTrabajoRepo: Repository<TipoTrabajo>,

    @InjectRepository(TipoPago)
    private readonly tipoPagoRepo: Repository<TipoPago>,

    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  // contratoDelAsesoramiento
  async contratoByAsesoramiento(id: string) {
    const findFechasContrato = await this.contratoRepo
      .createQueryBuilder('contrato')
      .select('contrato.fecha_inicio')
      .innerJoinAndSelect('contrato.tipoPago', 'tip')
      .where('contrato.id = :idContrato', { idContrato: id })
      .getRawOne();

    return findFechasContrato;
  }

  async createContrato(idAsesoramiento: number, dto: CreateContratoDto) {
    const asesoramiento = await this.asesoramientoRepo.findOneBy({
      id: idAsesoramiento,
    });
    if (!asesoramiento)
      throw new NotFoundException('Asesoramiento no encontrado');

    // ✅ Verificar si ya existe un contrato para este asesoramiento
    const contratoExistente = await this.contratoRepo.findOneBy({
      asesoramiento: { id: idAsesoramiento },
    });
    if (contratoExistente) {
      throw new BadRequestException(
        'Ya existe un contrato para este asesoramiento',
      );
    }

    const tipoTrabajo = await this.tipoTrabajoRepo.findOneBy({
      id: dto.idTipoTrabajo,
    });
    if (!tipoTrabajo) throw new NotFoundException('TipoTrabajo no encontrado');

    const tipoPago = await this.tipoPagoRepo.findOneBy({ id: dto.idTipoPago });
    if (!tipoPago) throw new NotFoundException('TipoPago no encontrado');

    const categoria = await this.categoriaRepo.findOneBy({
      id: dto.idCategoria,
    });
    if (!categoria) throw new NotFoundException('Categoria no encontrada');

    const contrato = this.contratoRepo.create({
      servicio: dto.servicio,
      modalidad: dto.modalidad,
      asesoramiento,
      tipoTrabajo,
      tipoPago,
      categoria,
    });

    return this.contratoRepo.save(contrato);
  }

  async updateContrato(idContrato: string, dto: UpdateContratoDto) {
    const contrato = await this.contratoRepo.findOne({
      where: { id: idContrato },
      relations: ['asesoramiento', 'tipoTrabajo', 'tipoPago', 'categoria'],
    });
    if (!contrato) throw new NotFoundException('Contrato no encontrado');

    // Actualizar campos si vienen en el DTO
    if (dto.servicio) contrato.servicio = dto.servicio;
    if (dto.modalidad) contrato.modalidad = dto.modalidad;

    if (dto.idTipoTrabajo) {
      const tipoTrabajo = await this.tipoTrabajoRepo.findOneBy({
        id: dto.idTipoTrabajo,
      });
      if (!tipoTrabajo)
        throw new NotFoundException('TipoTrabajo no encontrado');
      contrato.tipoTrabajo = tipoTrabajo;
    }

    if (dto.idTipoPago) {
      const tipoPago = await this.tipoPagoRepo.findOneBy({
        id: dto.idTipoPago,
      });
      if (!tipoPago) throw new NotFoundException('TipoPago no encontrado');
      contrato.tipoPago = tipoPago;
    }

    if (dto.idCategoria) {
      const categoria = await this.categoriaRepo.findOneBy({
        id: dto.idCategoria,
      });
      if (!categoria) throw new NotFoundException('Categoria no encontrada');
      contrato.categoria = categoria;
    }

    // Actualizar fechas si vienen
    if (dto.fechaInicio) contrato.fecha_inicio = new Date(dto.fechaInicio);
    if (dto.fechaFin) contrato.fecha_fin = new Date(dto.fechaFin);

    return this.contratoRepo.save(contrato);
  }

  async deleteContrato(idContrato: string) {
    const contrato = await this.contratoRepo.findOneBy({ id: idContrato });
    if (!contrato) throw new NotFoundException('Contrato no encontrado');

    await this.contratoRepo.remove(contrato);
    return { message: 'Contrato eliminado correctamente' };
  }
}
