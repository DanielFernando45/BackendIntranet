import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class LinkAdminToRol1758052610082 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('admin');

        if (!table) {
            throw new Error("La tabla 'admin' no existe. Ejecuta primero la migración que la crea.");
        }

        // 1️⃣ Eliminar foreign key que apunta a area si existe
        const fkArea = table.foreignKeys.find(fk => fk.columnNames.includes('id_area'));
        if (fkArea) await queryRunner.dropForeignKey('admin', fkArea);

        // 2️⃣ Eliminar columna id_area si existe
        const columnArea = table.columns.find(col => col.name === 'id_area');
        if (columnArea) await queryRunner.dropColumn('admin', 'id_area');

        // 3️⃣ Agregar columna id_rol solo si no existe
        const columnRol = table.columns.find(col => col.name === 'id_rol');
        if (!columnRol) {
            await queryRunner.addColumn('admin', new TableColumn({
                name: 'id_rol',
                type: 'varchar',
                length: '255',       // coincide con rol.id
                charset: 'utf8mb4',
                collation: 'utf8mb4_0900_ai_ci',
                isNullable: false
            }));
        }

        // 4️⃣ Asegurarnos que todos los registros tengan un id_rol válido
        const [adminRol] = await queryRunner.query(`
            SELECT id FROM rol WHERE nombre = 'admin' LIMIT 1
        `);

        if (!adminRol) {
            throw new Error("No existe un rol con nombre 'admin'");
        }

        await queryRunner.query(`
            UPDATE admin
            SET id_rol = '${adminRol.id}'
            WHERE id_rol IS NULL OR id_rol NOT IN (SELECT id FROM rol)
        `);

        // 5️⃣ Crear foreign key a rol solo si no existe
        const updatedTable = await queryRunner.getTable('admin'); // refrescar definición
        const fkRol = updatedTable?.foreignKeys.find(fk => fk.columnNames.includes('id_rol'));
        if (!fkRol) {
            await queryRunner.createForeignKey('admin', new TableForeignKey({
                columnNames: ['id_rol'],
                referencedColumnNames: ['id'],
                referencedTableName: 'rol',
                onDelete: 'CASCADE'
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('admin');

        if (!table) {
            throw new Error("La tabla 'admin' no existe, no se puede revertir la migración.");
        }

        // Revertir foreign key a rol si existe
        const fkRol = table.foreignKeys.find(fk => fk.columnNames.includes('id_rol'));
        if (fkRol) await queryRunner.dropForeignKey('admin', fkRol);

        // Eliminar columna id_rol si existe
        const columnRol = table.columns.find(col => col.name === 'id_rol');
        if (columnRol) await queryRunner.dropColumn('admin', 'id_rol');

        // Volver a crear columna id_area y su foreign key si no existe
        const columnArea = table.columns.find(col => col.name === 'id_area');
        if (!columnArea) {
            await queryRunner.addColumn('admin', new TableColumn({
                name: 'id_area',
                type: 'varchar',
                length: '36',
                isNullable: true
            }));
        }

        const updatedTable = await queryRunner.getTable('admin');
        const fkArea = updatedTable?.foreignKeys.find(fk => fk.columnNames.includes('id_area'));
        if (!fkArea) {
            await queryRunner.createForeignKey('admin', new TableForeignKey({
                columnNames: ['id_area'],
                referencedColumnNames: ['id'],
                referencedTableName: 'area',
                onDelete: 'CASCADE'
            }));
        }
    }
}
