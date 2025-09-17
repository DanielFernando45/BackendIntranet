import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAllAdmind1758125572700 implements MigrationInterface {
  name = 'RemoveAllAdmind1758125572700';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM admin`);
  }
  
  public async down(queryRunner: QueryRunner): Promise<void> {
    // 🔹 Si no quieres restaurar nada, lo dejamos vacío
    //    (O puedes insertar registros por defecto si necesitas)
    // Ejemplo de reinserción de un admin por defecto:
    // await queryRunner.query(
    //   `INSERT INTO admin (nombre, email, dni) VALUES (?, ?, ?)`,
    //   ['Admin Default', 'admin@example.com', '00000000'],
    // );
  }
}
