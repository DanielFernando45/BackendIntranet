import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentosToContrato1760468270135
  implements MigrationInterface
{
  name = 'AddDocumentosToContrato1760468270135';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`contrato\`
      ADD COLUMN \`documentos\` VARCHAR(255) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`contrato\`
      DROP COLUMN \`documentos\`
    `);
  }
}
