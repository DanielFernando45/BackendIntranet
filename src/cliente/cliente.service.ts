import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './cliente.entity';
import { Repository, DataSource } from 'typeorm';
import { UserRole } from 'src/usuario/usuario.entity';
import { CreateClienteDto } from './dto/crear-cliente.dto';
import { ListarClienteDto } from './dto/listar-cliente.dto';
import { updateClienteDto } from './dto/update-cliente.dto';
import { GradoAcademico } from 'src/common/entidades/gradoAcademico.entity';
import { UsuarioService } from 'src/usuario/usuario.service';
import { ListarClientesDto } from './dto/listar-clientes.dto';
import { AsesoramientoService } from 'src/asesoramiento/asesoramiento.service';
import { validate } from 'class-validator';
import { UpdateClienteDto } from 'src/admin/dto/update-admin.dto';
import { ClientesSinAsignar } from './dto/clientes-sin-asignar.dto';
import { updatedByClient } from './dto/updated-by-client.dto';
import { ProcesosAsesoria } from 'src/procesos_asesoria/entities/procesos_asesoria.entity';
import { ProcesosAsesoriaService } from 'src/procesos_asesoria/procesos_asesoria.service';
import { Rol } from '../rol/entities/rol.entity'; // Importa la entidad Rol

@Injectable()
export class ClienteService {
  constructor(
    private readonly usuarioService: UsuarioService,

    @Inject(forwardRef(() => AsesoramientoService))
    private readonly asesoramientoService: AsesoramientoService,

    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,

    @InjectRepository(Rol)
    private rolRepo: Repository<Rol>,

    @InjectRepository(GradoAcademico)
    private gradoAcademicoRepo: Repository<GradoAcademico>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async listClients(): Promise<ListarClientesDto[]> {
    const datosClientes = await this.clienteRepo
      .createQueryBuilder('c')
      .leftJoin(
        (qb) =>
          qb
            .select('pr.id', 'id')
            .addSelect('pr.id_cliente', 'id_cliente')
            .addSelect('pr.id_asesoramiento', 'id_asesoramiento')
            .from('procesos_asesoria', 'pr')
            .where(
              'pr.id IN (SELECT MIN(pr2.id) FROM procesos_asesoria pr2 GROUP BY pr2.id_cliente)',
            ),
        'pr',
        'pr.id_cliente = c.id',
      )
      .leftJoin('contrato', 'co', 'pr.id_asesoramiento = co.id_asesoramiento')
      .leftJoin('tipo_pago', 'tp', 'co.id_tipoPago = tp.id')
      .select([
        'c.id AS id',
        "CONCAT(c.nombre, ' ', c.apellido) AS cliente",
        'co.fecha_inicio AS fechaInicio',
        'co.fecha_fin AS fechaFinal',
        'c.carrera AS carrera',
        'co.modalidad AS modalidad',
        'tp.nombre AS tipopago',
      ])
      .getRawMany();

    if (!datosClientes || datosClientes.length === 0) {
      throw new NotFoundException('No se encontró ningún cliente');
    }

    return datosClientes;
  }

  async listOneClient(id: number): Promise<ListarClienteDto> {
    const oneCliente = await this.clienteRepo.findOne({
      where: { id },
      relations: ['gradoAcademico'],
      select: [
        'id',
        'nombre',
        'apellido',
        'telefono',
        'dni',
        'carrera',
        'gradoAcademico',
        'universidad',
        'pais',
        'email',
        'url_imagen',
      ],
    });
    if (!oneCliente)
      throw new NotFoundException(`No hay un cliente con ese ${id}`);
    const clienteDto: ListarClienteDto = {
      ...oneCliente,
      gradoAcademico: {
        id: oneCliente.gradoAcademico?.id,
        nombre: oneCliente.gradoAcademico?.nombre,
      },
    };
    return clienteDto;
  }

  async crearCliente(data: CreateClienteDto) {
    let savedUser;

    // 1️⃣ Buscar el rol "ESTUDIANTE" en la tabla Rol
    const rolEstudiante = await this.rolRepo.findOneBy({
      nombre: UserRole.ESTUDIANTE,
    });
    if (!rolEstudiante)
      throw new NotFoundException('No se encontró el rol ESTUDIANTE');

    // 2️⃣ Verificar si ya existe un cliente con ese email
    const exist = await this.clienteRepo.findOneBy({ email: data.email });
    if (exist) throw new ConflictException('Ya existe ese cliente');

    // 3️⃣ Crear usuario con relación al rol
    try {
      const dataUser = {
        username: data.email,
        password: data.dni,
        estado: true,
        rol: rolEstudiante, // <-- asignamos el objeto Rol directamente
      };

      savedUser = await this.usuarioService.createUserDefault(dataUser);
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al crear el usuario: ${err.message}`,
      );
    }

    // 4️⃣ Buscar grado académico
    const gradoAcademicoSearch = await this.gradoAcademicoRepo.findOneBy({
      id: data.gradoAcademico,
    });
    if (!gradoAcademicoSearch) {
      throw new NotFoundException('El grado académico especificado no existe');
    }

    // 5️⃣ Crear cliente asociado al usuario
    try {
      const cliente = this.clienteRepo.create({
        dni: data.dni,
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono,
        email: data.email,
        url_imagen: data.url_imagen || '',
        pais: data.pais,
        gradoAcademico: gradoAcademicoSearch,
        universidad: data.universidad,
        carrera: data.carrera,
        usuario: savedUser, // usuario con rol ESTUDIANTE asignado correctamente
      });

      return await this.clienteRepo.save(cliente);
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al crear el cliente: ${err.message}`,
      );
    }
  }

  async clientesSinAsignar(): Promise<ClientesSinAsignar[]> {
    const clientesSinProcesos = await this.dataSource
      .getRepository(Cliente)
      .createQueryBuilder('c')
      .leftJoin('c.procesosAsesoria', 'p')
      .leftJoinAndSelect('c.gradoAcademico', 'grado')
      .where('p.id IS NULL')
      .getMany();

    const clientesFormateados: ClientesSinAsignar[] = clientesSinProcesos.map(
      (cliente) => ({
        id: cliente.id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        gradoAcademico: cliente.gradoAcademico?.nombre ?? null,
        fecha_creacion: cliente.fecha_creacion,
        carrera: cliente.carrera,
      }),
    );

    return clientesFormateados;
  }

  async listarClientesAsignar(): Promise<ClientesSinAsignar[]> {
    const clientesSinProcesos = await this.dataSource
      .getRepository(Cliente)
      .createQueryBuilder('c')
      .leftJoin('c.procesosAsesoria', 'p')
      .leftJoinAndSelect('c.gradoAcademico', 'grado')
      .getMany();

    const clientesFormateados: ClientesSinAsignar[] = clientesSinProcesos.map(
      (cliente) => ({
        id: cliente.id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        gradoAcademico: cliente.gradoAcademico?.nombre ?? null,
        fecha_creacion: cliente.fecha_creacion,
        carrera: cliente.carrera,
      }),
    );

    return clientesFormateados;
  }

  async patchByClient(id: number, data: updatedByClient) {
    if (!Object.keys(data).length)
      throw new BadRequestException('No se envio un body para actualizar');

    const partialEntity: any = { ...data };

    const updated = await this.clienteRepo.update(id, partialEntity);
    if (updated.affected === 0)
      throw new NotFoundException('No hay registro a afectar');

    return updated;
  }

  async actualizarCliente(id: number, data: CreateClienteDto) {
    // 1️⃣ Buscar el cliente existente
    const clienteExist = await this.clienteRepo.findOne({
      where: { id },
      relations: ['usuario', 'gradoAcademico'],
    });

    if (!clienteExist) throw new NotFoundException('Cliente no encontrado');

    // 2️⃣ Si se actualiza el email, verificar que no exista otro cliente con ese email
    if (data.email && data.email !== clienteExist.email) {
      const emailExist = await this.clienteRepo.findOneBy({
        email: data.email,
      });
      if (emailExist)
        throw new ConflictException('El email ya está en uso por otro cliente');
    }

    // 3️⃣ Actualizar grado académico si se proporciona
    let gradoAcademicoActualizado = clienteExist.gradoAcademico;
    if (data.gradoAcademico) {
      const grado = await this.gradoAcademicoRepo.findOneBy({
        id: data.gradoAcademico,
      });
      if (!grado)
        throw new NotFoundException(
          'El grado académico especificado no existe',
        );
      gradoAcademicoActualizado = grado;
    }

    // 4️⃣ Actualizar los datos del cliente
    clienteExist.dni = data.dni ?? clienteExist.dni;
    clienteExist.nombre = data.nombre ?? clienteExist.nombre;
    clienteExist.apellido = data.apellido ?? clienteExist.apellido;
    clienteExist.telefono = data.telefono ?? clienteExist.telefono;
    clienteExist.email = data.email ?? clienteExist.email;
    clienteExist.url_imagen = data.url_imagen ?? clienteExist.url_imagen;
    clienteExist.pais = data.pais ?? clienteExist.pais;
    clienteExist.universidad = data.universidad ?? clienteExist.universidad;
    clienteExist.carrera = data.carrera ?? clienteExist.carrera;
    clienteExist.gradoAcademico = gradoAcademicoActualizado;

    // 5️⃣ Guardar los cambios
    try {
      return await this.clienteRepo.save(clienteExist);
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al actualizar el cliente: ${err.message}`,
      );
    }
  }
  
  async deletedCliente(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const usuario = await queryRunner.manager.findOne(Cliente, {
        where: { id },
        relations: ['usuario'],
      });
      if (!usuario || !usuario.usuario)
        throw new NotFoundException(
          'No se encontró el cliente o el usuario asociado',
        );
      const id_usuario = usuario?.usuario?.id;
      if (id_usuario === undefined)
        throw new NotFoundException('No se encontro el id de usuario');
      const deleted = await queryRunner.manager.delete(Cliente, { id });
      if (deleted.affected === 0)
        throw new Error('No se encontró el cliente para eliminar');
      await this.usuarioService.deleteUserWithCliente(
        id_usuario,
        queryRunner.manager,
      );
      await queryRunner.commitTransaction();
      return {
        message: 'Cliente eliminado correctamente',
        eliminados: deleted.affected,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Transacción fallida: ' + error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async desactivateCliente(id: number) {
    const cliente = await this.clienteRepo.findOne({
      where: { id },
      relations: ['usuario'],
      select: { usuario: { id: true } },
    });

    if (!cliente)
      return new NotFoundException('No se encontro el cliente en la bd');
    const id_usuario = cliente?.usuario.id;
    if (!id_usuario) throw new NotFoundException('No se encontro el id');
    const response = await this.usuarioService.desactivateUser(id_usuario);
    return {
      message: 'Usuario desactivado correctamente',
      affectado: response,
    };
  }
  catch(err) {
    throw new BadRequestException(
      `Esta mal la peticion se presenta el siguiente error :${err.message}`,
    );
  }

  async getAsesorias(id: number) {
    const listAsesorias =
      await this.asesoramientoService.asesoramientosByClient(id);

    return listAsesorias;
  }
  async getContratos(id: number) {
    const contrato =
      await this.asesoramientoService.contratoDelAsesoramiento(id);

    return contrato;
  }

  async getDelegado(id_asesoramiento: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const listAsesoramientoId = await queryRunner.manager.findOne(
        ProcesosAsesoria,
        {
          where: { asesoramiento: { id: id_asesoramiento } },
          relations: ['cliente'],
        },
      );
      if (!listAsesoramientoId)
        throw new NotFoundException(
          `No se encontraron asesoramientos con el ID ${id_asesoramiento}`,
        );

      const nombreDelegado = `${listAsesoramientoId.cliente.nombre} ${listAsesoramientoId.cliente.apellido}`;
      const delegado = {
        id: listAsesoramientoId.cliente.id,
        nombre_delegado: nombreDelegado,
      };
      await queryRunner.commitTransaction();
      return delegado;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Error en conseguir los datos ${err.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async listAllByAsesoramiento(id: number) {
    //     const asesoramientos = await this.dataSource.query(`
    //       SELECT
    //   c.id AS id_estudiante,
    //   CONCAT(c.nombre, ' ', c.apellido) AS estudiante
    // FROM procesos_asesoria AS pa
    // INNER JOIN cliente AS c ON c.id = pa.id_cliente
    // WHERE pa.id_asesoramiento = ${id};
    //   `);

    // console.log(asesoramientos);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const clientesByAsesoramiento = await queryRunner.manager.find(
        ProcesosAsesoria,
        {
          where: { asesoramiento: { id: id }, esDelegado: false },
          relations: ['cliente'],
        },
      );
      if (!clientesByAsesoramiento)
        throw new NotFoundException(
          `No se encontraron clientes con el ID ${id}`,
        );

      const estudiantes = clientesByAsesoramiento.map((item) => {
        return {
          id_estudiante: item.cliente.id,
          estudiante: `${item.cliente.nombre} ${item.cliente.apellido}`,
        };
      });

      await queryRunner.commitTransaction();
      return estudiantes;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Error en conseguir los datos ${err.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
