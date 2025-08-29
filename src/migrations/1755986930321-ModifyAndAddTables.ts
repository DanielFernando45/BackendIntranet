import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyAndAddTables1755986930321 implements MigrationInterface {
    name = 'ModifyAndAddTables1755986930321'

    public async up(queryRunner: QueryRunner): Promise<void> {


        await queryRunner.query(`ALTER TABLE \`asesor\` DROP FOREIGN KEY \`FK_31c3d36ed1fd055597ab389da36\``);
        await queryRunner.query(`ALTER TABLE \`admin\` DROP FOREIGN KEY \`FK_b2a61a8203d5efc23b68bf34d23\``);


        await queryRunner.query(`ALTER TABLE \`usuarios\` CHANGE \`role\` \`id_rol\` enum ('admin', 'asesor', 'estudiante', 'jefe_operaciones', 'supervisor', 'contrato_pago', 'asesor_inducciones', 'soporte', 'marketing') NOT NULL`);
        await queryRunner.query(`CREATE TABLE \`rol\` (\`id\` varchar(255) NOT NULL, \`nombre\` enum ('admin', 'asesor', 'estudiante', 'jefe_operaciones', 'supervisor', 'contrato_pago', 'asesor_inducciones', 'soporte', 'marketing') NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`supervisor\` (\`id\` varchar(255) NOT NULL, \`nombre\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`usuarioId\` int NULL, \`id_area\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`area\` (\`id\` varchar(255) NOT NULL, \`nombre\` varchar(255) NOT NULL, \`id_rol\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`asesor\` DROP COLUMN \`id_area\``);
        await queryRunner.query(`ALTER TABLE \`asesor\` ADD \`id_area\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`asesor\` ADD \`id_supervisor\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`usuarios\` DROP COLUMN \`id_rol\``);
        await queryRunner.query(`ALTER TABLE \`usuarios\` ADD \`id_rol\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`admin\` DROP COLUMN \`id_area\``);
        await queryRunner.query(`ALTER TABLE \`admin\` ADD \`id_area\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`supervisor\` ADD CONSTRAINT \`FK_dbf714549b6687c483773e14024\` FOREIGN KEY (\`usuarioId\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`supervisor\` ADD CONSTRAINT \`FK_8c041c0265dcaeedab1a7192243\` FOREIGN KEY (\`id_area\`) REFERENCES \`area\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`area\` ADD CONSTRAINT \`FK_dacfa77c770b2b14b5a9537437f\` FOREIGN KEY (\`id_rol\`) REFERENCES \`rol\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`asesor\` ADD CONSTRAINT \`FK_d48df25614f54096701993fcf63\` FOREIGN KEY (\`id_supervisor\`) REFERENCES \`supervisor\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`asesor\` ADD CONSTRAINT \`FK_31c3d36ed1fd055597ab389da36\` FOREIGN KEY (\`id_area\`) REFERENCES \`area\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`usuarios\` ADD CONSTRAINT \`FK_98bf89ebf4b0be2d3825f54e56c\` FOREIGN KEY (\`id_rol\`) REFERENCES \`rol\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`admin\` ADD CONSTRAINT \`FK_b2a61a8203d5efc23b68bf34d23\` FOREIGN KEY (\`id_area\`) REFERENCES \`area\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`admin\` DROP FOREIGN KEY \`FK_b2a61a8203d5efc23b68bf34d23\``);
        await queryRunner.query(`ALTER TABLE \`usuarios\` DROP FOREIGN KEY \`FK_98bf89ebf4b0be2d3825f54e56c\``);
        await queryRunner.query(`ALTER TABLE \`asesor\` DROP FOREIGN KEY \`FK_31c3d36ed1fd055597ab389da36\``);
        await queryRunner.query(`ALTER TABLE \`asesor\` DROP FOREIGN KEY \`FK_d48df25614f54096701993fcf63\``);
        await queryRunner.query(`ALTER TABLE \`area\` DROP FOREIGN KEY \`FK_dacfa77c770b2b14b5a9537437f\``);
        await queryRunner.query(`ALTER TABLE \`supervisor\` DROP FOREIGN KEY \`FK_8c041c0265dcaeedab1a7192243\``);
        await queryRunner.query(`ALTER TABLE \`supervisor\` DROP FOREIGN KEY \`FK_dbf714549b6687c483773e14024\``);
        await queryRunner.query(`ALTER TABLE \`admin\` DROP COLUMN \`id_area\``);
        await queryRunner.query(`ALTER TABLE \`admin\` ADD \`id_area\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`usuarios\` DROP COLUMN \`id_rol\``);
        await queryRunner.query(`ALTER TABLE \`usuarios\` ADD \`id_rol\` enum ('admin', 'asesor', 'estudiante', 'jefe_operaciones', 'supervisor', 'contrato_pago', 'asesor_inducciones', 'soporte', 'marketing') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`asesor\` DROP COLUMN \`id_area\``);
        await queryRunner.query(`ALTER TABLE \`asesor\` ADD \`id_area\` int NULL`);
        await queryRunner.query(`DROP TABLE \`area\``);
        await queryRunner.query(`DROP TABLE \`supervisor\``);
        await queryRunner.query(`DROP TABLE \`rol\``);
        await queryRunner.query(`ALTER TABLE \`usuarios\` CHANGE \`id_rol\` \`role\` enum ('admin', 'asesor', 'estudiante', 'jefe_operaciones', 'supervisor', 'contrato_pago', 'asesor_inducciones', 'soporte', 'marketing') NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`FK_b2a61a8203d5efc23b68bf34d23\` ON \`admin\` (\`id_area\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_31c3d36ed1fd055597ab389da36\` ON \`asesor\` (\`id_area\`)`);
    }
}
