import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveTipoContrato1757965051587 implements MigrationInterface {
    name = 'RemoveTipoContrato1757965051587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Eliminamos la tabla tipo_contrato si existe
        await queryRunner.query(`DROP TABLE IF EXISTS tipo_contrato;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restauramos la tabla tipo_contrato con sus columnas originales
        await queryRunner.query(`
            CREATE TABLE tipo_contrato (
                id INT NOT NULL AUTO_INCREMENT,
                nombre VARCHAR(255) NOT NULL,
                tipo_contrato VARCHAR(255) NOT NULL,
                tipo_entrega VARCHAR(255) NOT NULL,
                modalidad VARCHAR(255) NOT NULL,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);
    }
}
