import { MigrationInterface, QueryRunner } from 'typeorm';

export class RegisterAdvisorTitle1758922148984 implements MigrationInterface {
  name = 'RegisterAdvisorTitle1758922148984';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Actualización de títulos
    await queryRunner.query(`
      UPDATE \`Alejandria\`.asunto
      SET 
          \`titulo_asesor\` = CASE 
              WHEN \`id\` = '5a7b1d0a-1f9a-4f0e-948d-51339c5b132e' THEN 'Asesor de Avance 1'
              WHEN \`id\` = '2d6f8b7a-3dc6-49e7-92f7-72fd64d6c422' THEN 'Asesor de Corrección Parcial'
              WHEN \`id\` = '20ee1e91-6b31-4d34-8bb9-3f0e71628aa6' THEN 'Asesor de Entrega Final'
              WHEN \`id\` = 'b9c5c481-9a1c-4977-bc42-b68b6fc476db' THEN 'Asesor de Revisión de Antecedentes'
              WHEN \`id\` = 'd142e7e4-0e68-41b4-b8e4-e74de426383f' THEN 'Asesor de Corrección de Justificación'
              WHEN \`id\` = '68bd671f-458b-4e0c-a6ce-cd09a0d3e5ac' THEN 'Asesor de Entrega de Objetivos'
              WHEN \`id\` = '3a3f0070-d2ef-49d1-804a-9b9421aa147c' THEN 'Asesor de Entrega de Metodología'
              ELSE \`titulo_asesor\` 
          END;
    `);

    // Actualización de fechas
    await queryRunner.query(`
      UPDATE \`Alejandria\`.asunto
      SET 
          \`fecha_estimada\` = CASE 
              WHEN \`id\` = '5a7b1d0a-1f9a-4f0e-948d-51339c5b132e' THEN '2025-05-02 10:00:00'
              WHEN \`id\` = '2d6f8b7a-3dc6-49e7-92f7-72fd64d6c422' THEN '2025-05-10 15:30:00'
              WHEN \`id\` = 'b9c5c481-9a1c-4977-bc42-b68b6fc476db' THEN '2025-06-01 09:00:00'
              WHEN \`id\` = 'd142e7e4-0e68-41b4-b8e4-e74de426383f' THEN '2025-06-15 11:00:00'
              ELSE \`fecha_estimada\` 
          END;
    `);    
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir títulos
    await queryRunner.query(`
      UPDATE \`Alejandria\`.asunto
      SET \`titulo_asesor\` = NULL;
    `);

    // Revertir fechas
    await queryRunner.query(`
      UPDATE \`Alejandria\`.asunto
      SET \`fecha_estimada\` = NULL;
    `);
  }
}
