import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveAreaAsesor1757965051585 implements MigrationInterface {

    name = 'RemoveAreaAsesor1757965051585'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Eliminamos la tabla area_asesor si existe
        await queryRunner.query(`DROP TABLE IF EXISTS area_asesor;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restauramos la tabla con sus columnas
        await queryRunner.query(`
            CREATE TABLE area_asesor (
                id INT NOT NULL AUTO_INCREMENT,
                nombre VARCHAR(255) NOT NULL,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);
    }
}
