import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class AddTableOtherDocs1763561555085 implements MigrationInterface {
  name = 'AddTableOtherDocs1763561555085';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'asesoramiento_documentos',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'asesoramiento_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'titulo',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'fecha',
            type: 'date',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'asesoramiento_documentos',
      new TableForeignKey({
        columnNames: ['asesoramiento_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'asesoramiento',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'asesoramiento_documento_archivos',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'documento_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'url',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'asesoramiento_documento_archivos',
      new TableForeignKey({
        columnNames: ['documento_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'asesoramiento_documentos',
        onDelete: 'CASCADE', // si se elimina el documento, elimina todos los archivos
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('asesoramiento_documento_archivos', true);
    await queryRunner.dropTable('asesoramiento_documentos', true);
  }
}
