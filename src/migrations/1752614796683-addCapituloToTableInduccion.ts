import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCapituloToTableInduccion1752614796683 implements MigrationInterface {
    name = 'AddCapituloToTableInduccion1752614796683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE \`inducciones\`
        ADD \`capitulo\` varchar(255) NOT NULL AFTER \`titulo\`
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`inducciones\` DROP COLUMN \`capitulo\``);
    }

}
