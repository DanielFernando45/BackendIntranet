import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTesisSegundaEspecialidadToTipoTrabajo1757965051589 implements MigrationInterface {
    name = 'AddTesisSegundaEspecialidadToTipoTrabajo1757965051589'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insertar "Tesis Segunda Especialidad"
        await queryRunner.query(`
            INSERT INTO tipo_trabajo (nombre)
            VALUES 
                ('Tesis Segunda Especialidad');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar el registro insertado
        await queryRunner.query(`
            DELETE FROM tipo_trabajo 
            WHERE nombre = 'Tesis Segunda Especialidad';
        `);
    }
}
