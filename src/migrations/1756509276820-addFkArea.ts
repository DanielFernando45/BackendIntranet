import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1756509276820 implements MigrationInterface {
    name = 'Test1756509276820'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`supervisor\` DROP FOREIGN KEY \`FK_8c041c0265dcaeedab1a7192243\``);
        await queryRunner.query(`ALTER TABLE \`supervisor\` DROP COLUMN \`id_area\``);
        await queryRunner.query(`ALTER TABLE \`area\` ADD \`id_supervisor\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`area\` ADD CONSTRAINT \`FK_0cfbe13d0dbec5863bcd7624213\` FOREIGN KEY (\`id_supervisor\`) REFERENCES \`supervisor\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`area\` DROP FOREIGN KEY \`FK_0cfbe13d0dbec5863bcd7624213\``);
        await queryRunner.query(`ALTER TABLE \`area\` DROP COLUMN \`id_supervisor\``);
        await queryRunner.query(`ALTER TABLE \`supervisor\` ADD \`id_area\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`supervisor\` ADD CONSTRAINT \`FK_8c041c0265dcaeedab1a7192243\` FOREIGN KEY (\`id_area\`) REFERENCES \`area\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
