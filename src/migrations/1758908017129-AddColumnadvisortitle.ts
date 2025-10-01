import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnadvisortitle1758908017129 implements MigrationInterface {
  name = 'AddColumnadvisortitle1758908017129';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`asunto\` ADD \`titulo_asesor\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`asunto\` DROP COLUMN \`titulo_asesor\``,
    );
  }
}
