import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIdRolFromArea1680000000001 implements MigrationInterface {
  name = 'RemoveIdRolFromArea1680000000001';

  public async up(q: QueryRunner): Promise<void> {
    // 1) Si no existe la tabla, no hay nada que hacer (BD nueva)
    const hasArea = await q.hasTable('area');
    if (!hasArea) return;

    // 2) Si existe la FK, la eliminamos (MySQL no soporta DROP FOREIGN KEY IF EXISTS)
    const [fk] = await q.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'area'
        AND CONSTRAINT_NAME = 'FK_dacfa77c770b2b14b5a9537437f'
      LIMIT 1
    `);
    if (fk?.CONSTRAINT_NAME) {
      await q.query('ALTER TABLE `area` DROP FOREIGN KEY `FK_dacfa77c770b2b14b5a9537437f`');
    }

    // 3) Si existe la columna id_rol, la eliminamos
    const hasIdRol = await q.hasColumn('area', 'id_rol');
    if (hasIdRol) {
      await q.query('ALTER TABLE `area` DROP COLUMN `id_rol`');
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    // 1) Si no existe la tabla, nada que revertir
    const hasArea = await q.hasTable('area');
    if (!hasArea) return;

    // 2) Si no existe la columna, la creamos
    const hasIdRol = await q.hasColumn('area', 'id_rol');
    if (!hasIdRol) {
      await q.query('ALTER TABLE `area` ADD COLUMN `id_rol` INT NULL');
    }

    // 3) Si no existe la FK, la recreamos
    const [fk] = await q.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'area'
        AND CONSTRAINT_NAME = 'FK_dacfa77c770b2b14b5a9537437f'
      LIMIT 1
    `);
    if (!fk?.CONSTRAINT_NAME) {
      await q.query(`
        ALTER TABLE \`area\`
        ADD CONSTRAINT \`FK_dacfa77c770b2b14b5a9537437f\`
        FOREIGN KEY (\`id_rol\`) REFERENCES \`rol\`(\`id_rol\`)
        ON UPDATE CASCADE
      `);
    }
  }
}
