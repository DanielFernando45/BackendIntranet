import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFkAreaoOnAdmin1755630860632 implements MigrationInterface {
    name = 'AddFkAreaoOnAdmin1755630860632'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`admin\` ADD \`id_area\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`admin\` ADD CONSTRAINT \`FK_b2a61a8203d5efc23b68bf34d23\` FOREIGN KEY (\`id_area\`) REFERENCES \`area_asesor\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`UPDATE Alejandria.admin SET id_area = 1 WHERE id = 1`);
        await queryRunner.query(`UPDATE Alejandria.admin SET id_area = 1 WHERE id = 2`);
        await queryRunner.query(`UPDATE Alejandria.admin SET id_area = 2 WHERE id = 3`);
        await queryRunner.query(`UPDATE Alejandria.admin SET id_area = 2 WHERE id = 4`);
        await queryRunner.query(`UPDATE Alejandria.admin SET id_area = 3 WHERE id = 5`);
        await queryRunner.query(`UPDATE Alejandria.admin SET id_area = 3 WHERE id = 6`);
        await queryRunner.query(`UPDATE Alejandria.admin SET id_area = 4 WHERE id = 7`);
        await queryRunner.query(`UPDATE Alejandria.admin SET id_area = 4 WHERE id = 8`);
        await queryRunner.query(`UPDATE Alejandria.admin SET id_area = 5 WHERE id = 9`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`admin\` DROP FOREIGN KEY \`FK_b2a61a8203d5efc23b68bf34d23\``);
        await queryRunner.query(`ALTER TABLE \`admin\` DROP COLUMN \`id_area\``);
    }

}
