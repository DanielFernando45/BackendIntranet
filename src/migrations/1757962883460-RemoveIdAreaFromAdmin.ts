import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIdAreaFromAdmin1680000000002 implements MigrationInterface {
  name = 'RemoveIdAreaFromAdmin1680000000002';

  public async up(q: QueryRunner): Promise<void> {
    // 1. Verificar si existe la tabla admin
    const hasAdmin = await q.hasTable('admin');
    if (!hasAdmin) return;

    // 2. Verificar si existe la columna id_area
    const hasIdArea = await q.hasColumn('admin', 'id_area');
    if (!hasIdArea) return;

    // 3. Buscar FK asociada a id_area
    const [fk] = await q.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'admin'
        AND COLUMN_NAME = 'id_area'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      LIMIT 1
    `);

    // 4. Eliminar FK si existe
    if (fk?.CONSTRAINT_NAME) {
      await q.query(`ALTER TABLE \`admin\` DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
    }

    // 5. Eliminar la columna
    await q.query('ALTER TABLE `admin` DROP COLUMN `id_area`');
  }

  public async down(q: QueryRunner): Promise<void> {
    const hasAdmin = await q.hasTable('admin');
    if (!hasAdmin) return;

    const hasIdArea = await q.hasColumn('admin', 'id_area');
    if (!hasIdArea) {
      await q.query('ALTER TABLE `admin` ADD COLUMN `id_area` INT NULL');
    }

    const [fk] = await q.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'admin'
        AND COLUMN_NAME = 'id_area'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      LIMIT 1
    `);
    if (!fk?.CONSTRAINT_NAME) {
      await q.query(`
        ALTER TABLE \`admin\`
        ADD CONSTRAINT \`FK_admin_id_area\`
        FOREIGN KEY (\`id_area\`) REFERENCES \`area\`(\`id\`)
        ON UPDATE CASCADE
      `);
    }
  }
}
