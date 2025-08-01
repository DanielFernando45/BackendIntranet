import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInducciones1752267654595 implements MigrationInterface {
    name = 'AddInducciones1752267654595'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`soporte\` DROP FOREIGN KEY \`FK_ff56ee8ac6c4a2dfa4b6e7cfa5f\``);
        await queryRunner.query(`CREATE TABLE \`inducciones\` (\`id\` int NOT NULL AUTO_INCREMENT, \`titulo\` varchar(255) NOT NULL, \`url\` varchar(255) NOT NULL, \`id_asesoramiento\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`inducciones\` ADD CONSTRAINT \`FK_e1241e483398f525206e041650f\` FOREIGN KEY (\`id_asesoramiento\`) REFERENCES \`asesoramiento\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`soporte\` ADD CONSTRAINT \`FK_847bbcd8178948f2e0fba34984e\` FOREIGN KEY (\`id_cliente\`) REFERENCES \`cliente\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`soporte\` DROP FOREIGN KEY \`FK_847bbcd8178948f2e0fba34984e\``);
        await queryRunner.query(`ALTER TABLE \`inducciones\` DROP FOREIGN KEY \`FK_e1241e483398f525206e041650f\``);
        await queryRunner.query(`DROP TABLE \`inducciones\``);
        await queryRunner.query(`ALTER TABLE \`soporte\` ADD CONSTRAINT \`FK_ff56ee8ac6c4a2dfa4b6e7cfa5f\` FOREIGN KEY (\`id_cliente\`) REFERENCES \`cliente\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
