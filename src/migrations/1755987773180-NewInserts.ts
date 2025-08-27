import { MigrationInterface, QueryRunner } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

export class NewInserts1755987773180 implements MigrationInterface {
    name = 'NewInserts1755987773180'

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE \`rol\` CHANGE \`nombre\` \`nombre\` enum ('admin', 'asesor', 'estudiante', 'jefe_operaciones', 'supervisor', 'contrato_pago', 'asesor_inducciones', 'soporte', 'marketing') NOT NULL`);

        await queryRunner.query(`
        INSERT INTO Alejandria.area (id, nombre) VALUES 
        ('58e1231d-180a-4c6c-add1-990af1dcf4f7','Negocio'),
        ('d307e9b1-9f62-40ba-989e-e9f7d4344324','Social'),
        ('145b58f1-b41f-4eeb-a196-a01fa9f43aa7','Salud'),
        ('f0551441-7c5d-4765-aa3d-35530497250d','Ingenieria'),
        ('daf3c634-7cc7-4a99-a002-dddf4f7864e8','Legal');
      `);

        await queryRunner.query(`
        INSERT INTO Alejandria.rol (id, nombre) VALUES 
        ('c5e093ef-1d2d-4f30-ba93-201165142495','admin'),
        ('6c3e8fcd-5702-466a-988f-90d2a6a90846','asesor'),
        ('57807cf5-ae51-4585-a82d-148efb3a7e47','estudiante'),
        ('f56b13ac-c6fb-4458-ae6d-d49d906baa4e','jefe_operaciones'),
        ('8ae7ea2a-1409-4fba-99d0-bd5772a7a13f','supervisor'),
        ('59da2443-3149-4701-a4de-a313b55d24d0','contrato_pago'),
        ('0d9f2165-fa08-4b82-b1c3-4136ef281dcf','asesor_inducciones'),
        ('59c0674a-6760-418c-a1e2-a825e24ec87b','soporte'),
        ('943aa71e-5781-4837-8670-14e829043ea1','marketing')
      `);

        await queryRunner.query(`
            UPDATE Alejandria.usuarios 
            SET id_rol = CASE id 
                WHEN 29 THEN '943aa71e-5781-4837-8670-14e829043ea1'
                WHEN 28 THEN '59c0674a-6760-418c-a1e2-a825e24ec87b'
                WHEN 27 THEN '0d9f2165-fa08-4b82-b1c3-4136ef281dcf'
                WHEN 26 THEN '59da2443-3149-4701-a4de-a313b55d24d0'
                WHEN 25 THEN '8ae7ea2a-1409-4fba-99d0-bd5772a7a13f'
                WHEN 24 THEN 'f56b13ac-c6fb-4458-ae6d-d49d906baa4e'
            END
            WHERE id IN (24,25,26,27,28,29);
        `);


        await queryRunner.query(`
        UPDATE Alejandria.usuarios SET id_rol = CASE id  
            WHEN 21 THEN 'c5e093ef-1d2d-4f30-ba93-201165142495'
            WHEN 22 THEN 'c5e093ef-1d2d-4f30-ba93-201165142495'
            WHEN 23 THEN 'c5e093ef-1d2d-4f30-ba93-201165142495'
        END
        WHERE id IN (21,22,23);
      `);



        for (let index = 1; index <= 20; index++) {
            await queryRunner.query(`
            UPDATE Alejandria.usuarios SET id_rol = '57807cf5-ae51-4585-a82d-148efb3a7e47' WHERE id = ${index};
          `);
        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`rol\` CHANGE \`nombre\` \`nombre\` enum ('admin', 'asesor', 'estudiante', 'jefe_operaciones', 'supervisor', 'contrato_pago', 'asesor_inducciones', 'soporte') NOT NULL`);

        await queryRunner.query(`
        DELETE FROM Alejandria.rol WHERE nombre IN ('admin','asesor','estudiante','jefe_operaciones','supervisor','contrato_pago','asesor_inducciones','soporte','marketing');
      `);

        await queryRunner.query(`
        UPDATE Alejandria.usuarios SET id_rol = NULL WHERE id IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29);
      `);
    }

}
