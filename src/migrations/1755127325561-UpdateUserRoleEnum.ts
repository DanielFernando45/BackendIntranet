import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserRoleEnum1755127325561 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE usuarios 
      MODIFY role ENUM(
        'admin',
        'asesor',
        'estudiante',
        'jefe_operaciones',
        'supervisor',
        'contrato_pago',
        'asesor_inducciones',
        'soporte',
        'marketing'
      ) NOT NULL;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE usuarios 
      MODIFY role ENUM(
        'admin',
        'asesor',
        'estudiante'
      ) NOT NULL;
    `);
    }

}
