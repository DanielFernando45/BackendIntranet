import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Supervisor } from './entities/supervisor.entity';
import { Repository, In, Not, IsNull } from 'typeorm';
import { AreaService } from 'src/area/area.service';
import { Area } from 'src/area/entities/area.entity';
import { createSupervisorDto } from './dto/crear-supervisor.dto';
import { NotFoundException } from '@nestjs/common/exceptions';
import { UserRole, Usuario } from 'src/usuario/usuario.entity';
import { UpdateSupervisorDto } from './dto/update-supervisor-dto';
import { UsuarioService } from 'src/usuario/usuario.service';
import { Rol } from 'src/rol/entities/rol.entity';
import { Asesor } from 'src/asesor/asesor.entity';

@Injectable()
export class SupervisorService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly areaService: AreaService,

    @InjectRepository(Supervisor)
    private supervisorRepo: Repository<Supervisor>,

    @InjectRepository(Area)
    private areaRepo: Repository<Area>,

    @InjectRepository(Asesor)
    private asesorRepo: Repository<Asesor>,
  ) {}

  async createSupervisor(data: createSupervisorDto) {
    const usuarioRepo = this.supervisorRepo.manager.getRepository(Usuario);

    // 🔎 Validar email en usuarios
    const existUser = await usuarioRepo.findOne({
      where: { username: data.email },
    });
    if (existUser) {
      throw new BadRequestException('El email ya está en uso en usuarios');
    }

    // 🔎 Validar email en supervisor
    const existSupervisor = await this.supervisorRepo.findOneBy({
      email: data.email,
    });
    if (existSupervisor) {
      throw new BadRequestException('El email ya está en uso en supervisores');
    }

    // 🔎 Validar DNI en supervisor
    const dniSupervisor = await this.supervisorRepo.findOneBy({
      dni: data.dni,
    });
    if (dniSupervisor) {
      throw new BadRequestException(
        'El DNI ya está registrado en supervisores',
      );
    }

    // 🔎 Validar que las áreas no estén ocupadas
    let areasSeleccionadas: Area[] = [];
    if (data.areasIds && data.areasIds.length > 0) {
      const areaRepo = this.supervisorRepo.manager.getRepository(Area);

      areasSeleccionadas = await areaRepo.find({
        where: { id: In(data.areasIds) },
        relations: ['supervisor'],
      });

      const conflictivas = areasSeleccionadas.filter((a) => a.supervisor);
      if (conflictivas.length > 0) {
        throw new BadRequestException(
          `Las siguientes áreas ya tienen supervisor: ${conflictivas
            .map((a) => a.nombre) // 👈 solo mostramos el nombre
            .join(', ')}`,
        );
      }
    }

    // Buscar rol desde la tabla rol
    const rolRepo = this.supervisorRepo.manager.getRepository(Rol);
    const rol = await rolRepo.findOneBy({
      nombre: data.role || 'supervisor',
    });
    if (!rol) throw new NotFoundException('Rol no encontrado');

    // Crear usuario asociado
    const dataUser = {
      username: data.email,
      password: data.dni,
      rol,
      estado: true,
    };
    const savedUser = await this.usuarioService.createUserDefault(dataUser);

    try {
      const supervisor = this.supervisorRepo.create({
        ...data,
        usuario: savedUser,
      });

      const savedSupervisor = await this.supervisorRepo.save(supervisor);

      if (data.areasIds && data.areasIds.length > 0) {
        await this.assignAreasToSupervisor(savedSupervisor.id, data.areasIds);
      }

      return {
        message: '✅ Supervisor creado correctamente',
        data: {
          id: savedSupervisor.id,
          nombre: savedSupervisor.nombre,
          email: savedSupervisor.email,
          dni: savedSupervisor.dni,
          usuarioId: savedUser.id,
          rol: {
            id: rol.id,
            nombre: rol.nombre,
          },
          // 👇 Devolvemos nombres de las áreas en lugar de IDs
          areas: areasSeleccionadas.map((a) => a.nombre),
        },
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Error al crear Supervisor',
      );
    }
  }

  async updateSupervisor(id: string, data: UpdateSupervisorDto) {
    const supervisor = await this.supervisorRepo.findOne({
      where: { id },
      relations: ['usuario', 'area'],
    });

    if (!supervisor) {
      throw new NotFoundException('Supervisor no encontrado');
    }

    // 🔎 Validar email nuevo
    if (data.email && data.email !== supervisor.email) {
      const usuarioRepo = this.supervisorRepo.manager.getRepository(Usuario);

      const existUser = await usuarioRepo.findOne({
        where: { username: data.email },
      });
      if (existUser) {
        throw new BadRequestException('El email ya está en uso en usuarios');
      }

      const existSupervisor = await this.supervisorRepo.findOneBy({
        email: data.email,
      });
      if (existSupervisor) {
        throw new BadRequestException(
          'El email ya está en uso en supervisores',
        );
      }

      supervisor.email = data.email;
      supervisor.usuario.username = data.email;
    }

    // 🔎 Validar DNI nuevo
    if (data.dni && data.dni !== supervisor.dni) {
      const existDni = await this.supervisorRepo.findOneBy({ dni: data.dni });
      if (existDni) {
        throw new BadRequestException('El DNI ya está en uso en supervisores');
      }

      supervisor.dni = data.dni;
      supervisor.usuario.password = data.dni; // contraseña por defecto
    }

    /// 🔎 Validar áreas nuevas
    if ((data.areasIds ?? []).length > 0) {
      const areasOcupadas = await this.areaRepo.find({
        where: {
          id: In(data.areasIds!),
          supervisor: Not(IsNull()),
        },
        relations: ['supervisor'], // para saber si ya tiene supervisor
        select: ['id', 'nombre'], // 👈 traemos el nombre
      });

      // Filtrar las áreas que ya están ocupadas por otro supervisor distinto al actual
      const conflictivas = areasOcupadas.filter(
        (a) => a.supervisor?.id !== supervisor.id,
      );

      if (conflictivas.length > 0) {
        throw new BadRequestException(
          `Las siguientes áreas ya tienen supervisor: ${conflictivas
            .map((a) => a.nombre) // 👈 solo mostramos el nombre
            .join(', ')}`,
        );
      }
    }

    Object.assign(supervisor, data);

    const savedSupervisor = await this.supervisorRepo.save(supervisor);

    // Reasignar áreas si vienen nuevas
    if (data.areasIds) {
      await this.assignAreasToSupervisor(savedSupervisor.id, data.areasIds);
    }

    return {
      message: '✅ Supervisor actualizado correctamente',
      supervisor: {
        ...savedSupervisor,
        areas: data.areasIds || supervisor.areas?.map((a) => a.id) || [],
      },
    };
  }

  async deleteSupervisor(id: string) {
    const supervisor = await this.supervisorRepo.findOne({
      where: { id },
      relations: ['usuario', 'area'],
    });

    if (!supervisor) {
      throw new NotFoundException('Supervisor no encontrado');
    }

    // 1. Quitar la relación en las áreas
    await this.areaRepo.update({ supervisor: { id } }, { supervisor: null });

    // 2. Guardar id del usuario
    const usuarioId = supervisor.usuario.id;

    // 3. Eliminar el supervisor (solo supervisor, sin cascada)
    await this.supervisorRepo.delete(id);

    // 4. Eliminar usuario asociado
    await this.usuarioService.deleteUserWithCliente(
      usuarioId,
      this.supervisorRepo.manager,
    );

    return { message: 'Supervisor eliminado correctamente' };
  }

  async assignAreasToSupervisor(supervisorId: string, areasIds: string[]) {
    // 1️⃣ Verificar que las áreas existan
    const areas = await this.areaRepo.find({
      where: { id: In(areasIds) },
      relations: ['supervisor'], // incluir supervisor para validación
    });

    if (areas.length !== areasIds.length) {
      throw new BadRequestException('Algunas áreas no existen');
    }

    // 2️⃣ Detectar áreas ya asignadas a otro supervisor
    const conflictivas = areas.filter(
      (a) => a.supervisor && a.supervisor.id !== supervisorId,
    );

    // 3️⃣ Detectar áreas libres o asignadas al mismo supervisor
    const disponibles = areas.filter(
      (a) => !a.supervisor || a.supervisor.id === supervisorId,
    );

    // 4️⃣ Obtener el supervisor completo
    const supervisor = await this.supervisorRepo.findOne({
      where: { id: supervisorId },
    });
    if (!supervisor) {
      throw new NotFoundException('Supervisor no encontrado');
    }

    // 5️⃣ Si hay áreas conflictivas, lanzar error mostrando también las disponibles
    if (conflictivas.length > 0) {
      const nombresConflictivas = conflictivas.map((a) => a.nombre).join(', ');
      const nombresDisponibles =
        disponibles.map((a) => a.nombre).join(', ') || 'ninguna';
      throw new BadRequestException(
        `No se pudo asignar. Las siguientes áreas ya están asignadas a otro supervisor: ${nombresConflictivas}. Áreas disponibles: ${nombresDisponibles}`,
      );
    }

    // 6️⃣ Asignar el supervisor a las áreas disponibles
    for (const area of disponibles) {
      area.supervisor = supervisor;
      await this.areaRepo.save(area);
    }

    // 7️⃣ Retornar mensaje descriptivo
    const nombresAsignadas =
      disponibles.map((a) => a.nombre).join(', ') || 'ninguna';
    return {
      message: `✅ Se asignaron las áreas ${nombresAsignadas} al supervisor ${supervisor.nombre}`,
    };
  }

  // Método para desasignar áreas del supervisor
  async unassignAreasFromSupervisor(supervisorId: string, areasIds: string[]) {
    const areas = await this.areaRepo.find({
      where: { id: In(areasIds), supervisor: { id: supervisorId } },
      relations: ['supervisor'],
    });

    if (!areas.length) {
      return {
        message: 'No se encontraron áreas asignadas a este supervisor',
        areas: [],
      };
    }

    await this.areaRepo.update(
      { id: In(areas.map((a) => a.id)) },
      { supervisor: null },
    );

    return {
      message: `Se desasignaron ${areas.length} área(s) del supervisor`,
      areas,
    };
  }
  async getAreasBySupervisor(id: string) {
    const areas = await this.areaRepo.find({
      where: { supervisor: { id } },
      relations: ['supervisor', 'asesor'], // actualizado: se usa 'asesor' en lugar de 'asesores'
    });

    if (areas.length === 0) {
      throw new BadRequestException('El supervisor no tiene áreas asignadas');
    }

    // Transformamos los datos para devolver solo lo necesario
    return areas.map((area) => ({
      id: area.id,
      nombre: area.nombre,
      supervisor: {
        id: area.supervisor ? area.supervisor.id : '',
        nombre: area.supervisor ? area.supervisor.nombre : '',
        email: area.supervisor ? area.supervisor.email : '',
      },
      asesores: area.asesor.map((asesor) => ({
        id: asesor.id,
        nombre: asesor.nombre,
        email: asesor.email,
      })),
    }));
  }
  // Método para obtener supervisor con sus áreas
  async getSupervisorWithAreas(id: string) {
    const supervisor = await this.supervisorRepo.findOne({
      where: { id },
      relations: ['area', 'usuario'],
    });

    if (!supervisor) throw new BadRequestException('Supervisor no encontrado');
    return supervisor;
  }
}
