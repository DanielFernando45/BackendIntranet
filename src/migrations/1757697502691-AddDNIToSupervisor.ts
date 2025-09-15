import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDNIToSupervisor1757697502691 implements MigrationInterface {

    name = 'AddDNIToSupervisor1757697502691'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`supervisor\`ADD \`dni\` varchar(8) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`supervisor\` DROP COLUMN \`dni\``);
    }

}
