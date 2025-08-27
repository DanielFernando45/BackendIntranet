import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveFieldEstadoFromContrato1755551631791 implements MigrationInterface {
    name = 'RemoveFieldEstadoFromContrato1755551631791'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`contrato\` DROP COLUMN \`estado\``);
        await queryRunner.query(`
        ALTER TABLE \`asesoramiento\`
        ADD \`estado\` varchar(255) NOT NULL AFTER \`profesion_asesoria\`
    `);

        await queryRunner.query(`
            UPDATE \`asesoramiento\` SET \`estado\` = 'activo'
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`contrato\` ADD \`estado\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` DROP COLUMN \`estado\``);
    }

}
