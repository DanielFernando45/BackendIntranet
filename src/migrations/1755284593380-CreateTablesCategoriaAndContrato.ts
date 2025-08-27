import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTablesCategoriaAndContrato1755284593380 implements MigrationInterface {
    name = 'NewTables1755215067660'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`contrato\` (\`id\` varchar(36) NOT NULL, \`servicio\` varchar(255) NOT NULL, \`estado\` varchar(255) NOT NULL, \`modalidad\` varchar(255) NOT NULL, \`fecha_inicio\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fecha_fin\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`id_asesoramiento\` int NULL, \`id_tipoTrabajo\` int NULL, \`id_tipoPago\` int NULL, \`id_categoria\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`categoria\` (\`id\` varchar(36) NOT NULL, \`descripcion\` enum ('bronce', 'plata', 'oro') NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        // FKs
        await queryRunner.query(`
            ALTER TABLE \`contrato\`
            ADD CONSTRAINT \`FK_contrato_categoria\` FOREIGN KEY (\`id_categoria\`) REFERENCES \`categoria\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`contrato\`
            ADD CONSTRAINT \`FK_contrato_asesoramiento\` FOREIGN KEY (\`id_asesoramiento\`) REFERENCES \`asesoramiento\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`contrato\`
            ADD CONSTRAINT \`FK_contrato_tipo_trabajo\` FOREIGN KEY (\`id_tipoTrabajo\`) REFERENCES \`tipo_trabajo\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`contrato\`
            ADD CONSTRAINT \`FK_contrato_tipo_pago\` FOREIGN KEY (\`id_tipoPago\`) REFERENCES \`tipo_pago\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar FKs
        await queryRunner.query(`ALTER TABLE \`contrato\` DROP FOREIGN KEY \`FK_contrato_tipo_pago\``);
        await queryRunner.query(`ALTER TABLE \`contrato\` DROP FOREIGN KEY \`FK_contrato_tipo_trabajo\``);
        await queryRunner.query(`ALTER TABLE \`contrato\` DROP FOREIGN KEY \`FK_contrato_asesoramiento\``);
        await queryRunner.query(`ALTER TABLE \`contrato\` DROP FOREIGN KEY \`FK_contrato_categoria\``);


        await queryRunner.query(`DROP TABLE \`categoria\``);
        await queryRunner.query(`DROP TABLE \`contrato\``);
    }

}
