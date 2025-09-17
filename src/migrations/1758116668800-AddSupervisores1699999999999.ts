import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

export class AddSupervisores1699999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const supervisores = [
      {
        nombre: 'Oleka',
        email: 'oleka@example.com',
        dni: '12345678',
        areas: ['f0551441-7c5d-4765-aa3d-35530497250d'],
      },
      {
        nombre: 'Diana',
        email: 'diana@example.com',
        dni: '22334455',
        areas: ['145b58f1-b41f-4eeb-a196-a01fa9f43aa7'],
      },
      {
        nombre: 'Brenda',
        email: 'brenda@example.com',
        dni: '33445566',
        areas: [
          'daf3c634-7cc7-4a99-a002-dddf4f7864e8',
          '58e1231d-180a-4c6c-add1-990af1dcf4f7',
        ],
      },
      {
        nombre: 'Karen',
        email: 'karen@example.com',
        dni: '44556677',
        areas: ['d307e9b1-9f62-40ba-989e-e9f7d4344324'],
      },
    ];

    const supervisorRoleId = '8ae7ea2a-1409-4fba-99d0-bd5772a7a13f';

    for (const sup of supervisores) {
      const hashedPassword = await bcrypt.hash(sup.dni, 10);

      // 🔹 Crear usuario AUTO_INCREMENT con rol de supervisor
      const result = await queryRunner.query(
        `INSERT INTO usuarios (username, password, estado, id_rol)
         VALUES (?, ?, true, ?)`,
        [sup.email, hashedPassword, supervisorRoleId],
      );

      // 🔹 Obtener el ID generado automáticamente
      const userId = result.insertId;

      // 🔹 Crear supervisor con UUID
      const supervisorId = uuidv4();
      await queryRunner.query(
        `INSERT INTO supervisor (id, nombre, email, dni, usuarioId)
         VALUES (?, ?, ?, ?, ?)`,
        [supervisorId, sup.nombre, sup.email, sup.dni, userId],
      );

      // 🔹 Asignar áreas (columna correcta: id_supervisor)
      for (const areaId of sup.areas) {
        await queryRunner.query(
          `UPDATE area SET id_supervisor = ? WHERE id = ?`,
          [supervisorId, areaId],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const emails = [
      'oleka@example.com',
      'diana@example.com',
      'brenda@example.com',
      'karen@example.com',
    ];

    // 🔹 Limpiar áreas
    const areaIds = [
      'f0551441-7c5d-4765-aa3d-35530497250d',
      '145b58f1-b41f-4eeb-a196-a01fa9f43aa7',
      'daf3c634-7cc7-4a99-a002-dddf4f7864e8',
      '58e1231d-180a-4c6c-add1-990af1dcf4f7',
      'd307e9b1-9f62-40ba-989e-e9f7d4344324',
    ];
    for (const areaId of areaIds) {
      await queryRunner.query(
        `UPDATE area SET id_supervisor = NULL WHERE id = ?`,
        [areaId],
      );
    }

    // 🔹 Eliminar supervisores
    await queryRunner.query(`DELETE FROM supervisor WHERE email IN (?)`, [
      emails,
    ]);

    // 🔹 Eliminar usuarios
    await queryRunner.query(`DELETE FROM usuarios WHERE username IN (?)`, [
      emails,
    ]);
  }
}
