import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStimatedDateToAsunto1758742812194
  implements MigrationInterface
{
  name = 'AddStimatedDateToAsunto1758742812194';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`asunto\` ADD \`fecha_estimada\` datetime NULL AFTER \`fecha_revision\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`asunto\` DROP COLUMN \`fecha_estimada\``,
    );
  }
}
