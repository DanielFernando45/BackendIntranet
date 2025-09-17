import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class RemoveIdSupervisorFromAsesor1758058633614
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1️⃣ Eliminar la llave foránea primero
    await queryRunner.query(`
            ALTER TABLE asesor
            DROP FOREIGN KEY FK_d48df25614f54096701993fcf63
        `);

    // 2️⃣ Eliminar el índice asociado
    await queryRunner.query(`
            DROP INDEX FK_d48df25614f54096701993fcf63 ON asesor
        `);

    // 3️⃣ Eliminar la columna
    await queryRunner.query(`
            ALTER TABLE asesor
            DROP COLUMN id_supervisor
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1️⃣ Volver a crear la columna
    await queryRunner.query(`
            ALTER TABLE asesor
            ADD COLUMN id_supervisor varchar(36) DEFAULT NULL
        `);

    // 2️⃣ Volver a crear el índice
    await queryRunner.query(`
            CREATE INDEX FK_d48df25614f54096701993fcf63 ON asesor(id_supervisor)
        `);

    // 3️⃣ Volver a crear la llave foránea
    await queryRunner.query(`
            ALTER TABLE asesor
            ADD CONSTRAINT FK_d48df25614f54096701993fcf63
            FOREIGN KEY (id_supervisor) REFERENCES supervisor(id)
        `);
  }
}
