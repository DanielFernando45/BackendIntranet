import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class AddTableAudiAdvisory1760717747246 implements MigrationInterface {
  name = 'AddTableAudiAdvisory1760717747246';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla auditoria_asesoria
    await queryRunner.createTable(
      new Table({
        name: 'auditoria_asesoria',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'id_proceso_asesoria',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'id_asesor',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'tipo',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'accion',
            type: 'varchar',
            length: '150',
          },
          {
            name: 'descripcion',
            type: 'text',
          },
          {
            name: 'fecha_creacion',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'detalle',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // FK hacia procesos_asesoria
    await queryRunner.createForeignKey(
      'auditoria_asesoria',
      new TableForeignKey({
        columnNames: ['id_proceso_asesoria'],
        referencedTableName: 'procesos_asesoria',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // FK hacia asesor
    await queryRunner.createForeignKey(
      'auditoria_asesoria',
      new TableForeignKey({
        columnNames: ['id_asesor'],
        referencedTableName: 'asesor',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('auditoria_asesoria');
  }
}
