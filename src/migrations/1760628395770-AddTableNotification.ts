import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class AddTableNotification1760628395770 implements MigrationInterface {
  name = 'AddTableNotification1760628395770';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notificaciones',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'id_cliente_emisor',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'id_cliente_receptor',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'id_asesor_emisor',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'id_asesor_receptor',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'id_contrato',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'mensaje',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'tipo',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'leida',
            type: 'boolean',
            default: false,
          },
          {
            name: 'fecha_creacion',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'vence_en',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // 🔗 Relaciones
    await queryRunner.createForeignKey(
      'notificaciones',
      new TableForeignKey({
        columnNames: ['id_cliente_emisor'],
        referencedColumnNames: ['id'],
        referencedTableName: 'cliente',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'notificaciones',
      new TableForeignKey({
        columnNames: ['id_cliente_receptor'],
        referencedColumnNames: ['id'],
        referencedTableName: 'cliente',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'notificaciones',
      new TableForeignKey({
        columnNames: ['id_asesor_emisor'],
        referencedColumnNames: ['id'],
        referencedTableName: 'asesor',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'notificaciones',
      new TableForeignKey({
        columnNames: ['id_asesor_receptor'],
        referencedColumnNames: ['id'],
        referencedTableName: 'asesor',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'notificaciones',
      new TableForeignKey({
        columnNames: ['id_contrato'],
        referencedColumnNames: ['id'],
        referencedTableName: 'contrato',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('notificaciones');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('notificaciones', fk);
      }
    }

    await queryRunner.dropTable('notificaciones');
  }
}
