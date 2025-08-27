import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUnusedFieldsFromAsesoramiento1755207096252 implements MigrationInterface {
    name = 'RemoveUnusedFieldsFromAsesoramiento1755207096252'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` DROP FOREIGN KEY \`FK_6e9597d7abfb30df60996e0ab8b\``);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` DROP FOREIGN KEY \`FK_dfe1c20580248b8d9ce30a9f195\``);
        await queryRunner.query(`CREATE TABLE \`tipo_pago\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`nombre\` varchar(100) NOT NULL,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);


        await queryRunner.query(`ALTER TABLE \`asesoramiento\` DROP COLUMN \`especialidad\``);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` DROP COLUMN \`tipo_servicio\``);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` DROP COLUMN \`estado\``);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` DROP COLUMN \`fecha_inicio\``);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` DROP COLUMN \`fecha_fin\``);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` DROP COLUMN \`id_tipo_trabajo\``);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` DROP COLUMN \`id_contrato\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`asesoramiento\` ADD \`id_contrato\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` ADD \`id_tipo_trabajo\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` ADD \`fecha_fin\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` ADD \`fecha_inicio\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` ADD \`estado\` enum ('activo', 'desactivado', 'finalizado') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` ADD \`tipo_servicio\` enum ('proyecto', 'informe_final', 'completo') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` ADD \`especialidad\` varchar(255) NULL`);
        await queryRunner.query(`DROP TABLE \`tipo_pago\``);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` ADD CONSTRAINT \`FK_dfe1c20580248b8d9ce30a9f195\` FOREIGN KEY (\`id_contrato\`) REFERENCES \`tipo_contrato\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` ADD CONSTRAINT \`FK_6e9597d7abfb30df60996e0ab8b\` FOREIGN KEY (\`id_tipo_trabajo\`) REFERENCES \`tipo_trabajo\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
