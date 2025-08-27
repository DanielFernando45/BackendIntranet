import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertsToNewTables1755289132368 implements MigrationInterface {
    name = 'InsertsToNewTables1755289132368'

    public async up(queryRunner: QueryRunner): Promise<void> {

        let idCategoria01 = 'c4ad9ec9-2631-47fb-92e3-5493e2cc1703'
        let idCategoria02 = 'cdf0ac54-a9f1-4f06-bcfe-f4f5a1d5b4d1'

        await queryRunner.query(`
        INSERT INTO Alejandria.categoria (id, descripcion) VALUES ('c4ad9ec9-2631-47fb-92e3-5493e2cc1703','bronce');
      `);
        await queryRunner.query(`
        INSERT INTO Alejandria.categoria (id, descripcion) VALUES ('cdf0ac54-a9f1-4f06-bcfe-f4f5a1d5b4d1','plata');
      `);
        await queryRunner.query(`
        INSERT INTO Alejandria.categoria (id, descripcion) VALUES ('5f1b4ec3-3777-4cbc-82a0-cd33d9aec4a0','oro');
      `);

        await queryRunner.query(`
        INSERT INTO Alejandria.tipo_pago (nombre) VALUES ('contado');
      `);
        await queryRunner.query(`
        INSERT INTO Alejandria.tipo_pago (nombre) VALUES ('cuotas');
      `);

        await queryRunner.query(`
        INSERT INTO Alejandria.contrato (
            id,
            servicio,
            estado,
            modalidad,
            id_asesoramiento,
            id_tipoTrabajo,
            id_tipoPago,
            id_categoria)
        VALUES ('8e88bd51-9430-4a2b-83b5-c4781e03a73b','proyecto', 'activo', 'avance', ${1},${3},${1},'${idCategoria01}');
      `);

        await queryRunner.query(`
        INSERT INTO Alejandria.contrato (
            id,
            servicio,
            estado,
            modalidad,
            id_asesoramiento,
            id_tipoTrabajo,
            id_tipoPago,
            id_categoria)
        VALUES ('8096e167-fd86-460b-bba2-424e8f4560f6','completo', 'activo', 'avance', ${2},${3},${2},'${idCategoria01}');
      `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`categoria\``);
        await queryRunner.query(`DROP TABLE \`contrato\``);
    }

}
