import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcrypt";

export class InsertNewUsers1755127629248 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const admins = [
            { id: 24, dni: 98141554, correo: "jefeoperaciones@gmail.com", role: "jefe_operaciones", nombre: "Jefe Operaciones" },
            { id: 25, dni: 83981514, correo: "supervisor@gmail.com", role: "supervisor", nombre: "Supervisor" },
            { id: 26, dni: 45641512, correo: "contrato_pago@gmail.com", role: "contrato_pago", nombre: "Contrato y Pago" },
            { id: 27, dni: 89431519, correo: "asesorinducciones@gmail.com", role: "asesor_inducciones", nombre: "Asesor Inducciones" },
            { id: 28, dni: 63441898, correo: "soporte@gmail.com", role: "soporte", nombre: "Soporte" },
            { id: 29, dni: 23941516, correo: "marketing@gmail.com", role: "marketing", nombre: "Marketing" }
        ];

        for (const a of admins) {
            const hashed = await bcrypt.hash(`${a.dni}`, 10);

            await queryRunner.query(`
        INSERT INTO Alejandria.usuarios (id, username, password, role, estado)
        VALUES (${a.id}, '${a.correo}', '${hashed}', '${a.role}', 1);
      `);

            await queryRunner.query(`
        INSERT INTO Alejandria.admin (nombre, email, dni, usuarioId)
        VALUES ('${a.nombre}', '${a.correo}', '${a.dni}', ${a.id});
      `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      DELETE FROM Alejandria.admin
      WHERE usuarioId BETWEEN 24 AND 29;
    `);

        await queryRunner.query(`
      DELETE FROM Alejandria.usuarios
      WHERE id BETWEEN 24 AND 29;
    `);
    }

}
