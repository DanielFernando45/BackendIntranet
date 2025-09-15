import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIdAreaFromAdmin1680000000002 implements MigrationInterface {
    
    name = 'RemoveIdAreaFromAdmin1680000000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Eliminamos la foreign key si existe
        await queryRunner.query(`
            SET @fk_name = (
                SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'admin' 
                  AND COLUMN_NAME = 'id_area' 
                  AND REFERENCED_TABLE_NAME IS NOT NULL
            );
        `);

        await queryRunner.query(`
            SET @sql = IF(@fk_name IS NOT NULL, CONCAT('ALTER TABLE admin DROP FOREIGN KEY ', @fk_name), 'SELECT 1');
        `);

        await queryRunner.query(`PREPARE stmt FROM @sql;`);
        await queryRunner.query(`EXECUTE stmt;`);
        await queryRunner.query(`DEALLOCATE PREPARE stmt;`);
        
        // Luego eliminamos la columna
        await queryRunner.query(`ALTER TABLE admin DROP COLUMN id_area;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restauramos la columna
        await queryRunner.query(`ALTER TABLE admin ADD COLUMN id_area INT;`);
        
        // Restauramos la foreign key apuntando a area(id_area)
        await queryRunner.query(`
            ALTER TABLE admin
            ADD CONSTRAINT FK_admin_id_area
            FOREIGN KEY (id_area) REFERENCES area(id_area)
        `);
    }
}
