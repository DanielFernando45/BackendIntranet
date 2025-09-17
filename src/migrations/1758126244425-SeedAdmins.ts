import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcrypt";

export class InsertAdminsAndUsers1800000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const admins = [
      {
        nombre: "Katy Moreno",
        email: "KatyContratopago@alejandria.com",
        dni: "12345678",
        id_rol: "59da2443-3149-4701-a4de-a313b55d24d0", // contrato_pago
      },
      {
        nombre: "Lucia Estrada",
        email: "LuciaMarketing@alejandria.com",
        dni: "87654321",
        id_rol: "943aa71e-5781-4837-8670-14e829043ea1", // marketing
      },
      {
        nombre: "Oficina TI",
        email: "OficinaTISoporte@alejandria.com",
        dni: "11223344",
        id_rol: "59c0674a-6760-418c-a1e2-a825e24ec87b", // soporte
      },
      {
        nombre: "Karen Moreno",
        email: "KarenOperaciones@alejandria.com",
        dni: "99887766",
        id_rol: "f56b13ac-c6fb-4458-ae6d-d49d906baa4e", // jefe_operaciones
      },
    ];

    for (const admin of admins) {
      // 1️⃣ Hashear contraseña (dni)
      const hashedPassword = await bcrypt.hash(admin.dni, 10);

      // 2️⃣ Insertar en usuarios
      await queryRunner.query(
        `INSERT INTO usuarios (username, password, estado, id_rol)
         VALUES (?, ?, 1, ?)`,
        [admin.email, hashedPassword, admin.id_rol],
      );

      // 3️⃣ Obtener el id autogenerado de usuarios
      const [{ id: usuarioId }] = await queryRunner.query(
        `SELECT LAST_INSERT_ID() as id`,
      );

      // 4️⃣ Insertar en admin con la FK a usuarios
      await queryRunner.query(
        `INSERT INTO admin (nombre, email, dni, usuarioId, id_rol)
         VALUES (?, ?, ?, ?, ?)`,
        [admin.nombre, admin.email, admin.dni, usuarioId, admin.id_rol],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const emails = [
      "KatyContratopago@alejandria.com",
      "LuciaMarketing@alejandria.com",
      "OficinaTISoporte@alejandria.com",
      "KarenOperaciones@alejandria.com",
    ];

    // 🔹 Borrar de admin
    await queryRunner.query(
      `DELETE FROM admin WHERE email IN (?)`,
      [emails],
    );

    // 🔹 Borrar de usuarios
    await queryRunner.query(
      `DELETE FROM usuarios WHERE username IN (?)`,
      [emails],
    );
  }
}
