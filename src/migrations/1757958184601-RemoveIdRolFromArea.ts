import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIdRolFromArea1680000000001 implements MigrationInterface {
    
    name = 'RemoveIdRolFromArea1680000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Primero eliminamos la foreign key que depende de id_rol
        await queryRunner.query(`ALTER TABLE area DROP FOREIGN KEY FK_dacfa77c770b2b14b5a9537437f;`);
        
        // Luego eliminamos la columna
        await queryRunner.query(`ALTER TABLE area DROP COLUMN id_rol;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restauramos la columna
        await queryRunner.query(`ALTER TABLE area ADD COLUMN id_rol INT;`);
        
        // Restauramos la foreign key hacia la tabla rol
        await queryRunner.query(`
            ALTER TABLE area
            ADD CONSTRAINT FK_dacfa77c770b2b14b5a9537437f
            FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
        `);
    }
}
