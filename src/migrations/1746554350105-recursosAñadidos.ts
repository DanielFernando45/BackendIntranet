import { MigrationInterface, QueryRunner } from "typeorm";

export class RecursosAñadidos1746554350105 implements MigrationInterface {
    name = 'RecursosAñadidos1746554350105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`usuarios\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` enum ('admin', 'asesor', 'estudiante') NOT NULL, \`estado\` tinyint NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`admin\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`dni\` varchar(255) NOT NULL, \`usuarioId\` int NULL, UNIQUE INDEX \`REL_d6655cf5853701ab8ac2d7d4d3\` (\`usuarioId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tipo_contrato\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`tipo_contrato\` varchar(255) NOT NULL, \`tipo_entrega\` varchar(255) NOT NULL, \`modalidad\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tipo_trabajo\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`pago\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`monto\` int NOT NULL, \`fecha_pago\` datetime NULL, \`estado_pago\` enum ('pagado', 'por_pagar') NOT NULL, \`id_informacion_pago\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`informacion_pagos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`titulo\` varchar(255) NOT NULL, \`pago_total\` int NOT NULL, \`tipo_pago\` enum ('contado', 'cuotas') NOT NULL, \`tipo_servicio\` enum ('asesoria', 'otros') NOT NULL, \`numero_cuotas\` int NULL, \`fecha_creado\` datetime NOT NULL, \`id_asesoramiento\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`asesoramiento\` (\`id\` int NOT NULL AUTO_INCREMENT, \`profesion_asesoria\` varchar(255) NOT NULL, \`especialidad\` varchar(255) NULL, \`tipo_servicio\` enum ('proyecto', 'informe_final', 'completo') NOT NULL, \`estado\` enum ('activo', 'desactivado', 'finalizado') NOT NULL, \`fecha_inicio\` datetime NOT NULL, \`fecha_fin\` datetime NOT NULL, \`id_tipo_trabajo\` int NULL, \`id_contrato\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`procesos_asesoria\` (\`id\` int NOT NULL AUTO_INCREMENT, \`id_cliente\` int NULL, \`id_asesor\` int NULL, \`id_asesoramiento\` int NULL, \`esDelegado\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cliente\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dni\` varchar(255) NOT NULL, \`nombre\` varchar(255) NOT NULL, \`apellido\` varchar(255) NOT NULL, \`telefono\` int NOT NULL, \`email\` varchar(255) NOT NULL, \`url_imagen\` varchar(255) NOT NULL, \`pais\` varchar(255) NOT NULL, \`universidad\` varchar(255) NOT NULL, \`fecha_creacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`carrera\` varchar(255) NOT NULL, \`id_grado_academico\` int NULL, \`usuarioId\` int NULL, UNIQUE INDEX \`REL_26eb6132b607fd16d904df0367\` (\`usuarioId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`grado_academico\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`area_asesor\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`asesor\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dni\` varchar(255) NOT NULL, \`nombre\` varchar(255) NOT NULL, \`apellido\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`telefono\` int NOT NULL, \`url_imagen\` varchar(255) NOT NULL, \`especialidad\` varchar(255) NOT NULL, \`universidad\` varchar(255) NOT NULL, \`id_area\` int NULL, \`id_grado_academico\` int NULL, \`usuarioId\` int NULL, UNIQUE INDEX \`REL_285f003441aa6855dc95f4c7b8\` (\`usuarioId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`documento\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`ruta\` varchar(255) NOT NULL, \`subido_por\` enum ('estudiante', 'asesor') NOT NULL, \`created_at\` datetime NOT NULL, \`id_asunto\` char(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`asunto\` (\`id\` char(36) NOT NULL DEFAULT (UUID()), \`titulo\` varchar(255) NOT NULL, \`estado\` enum ('entregado', 'proceso', 'terminado') NOT NULL, \`fecha_entregado\` datetime NOT NULL, \`fecha_revision\` datetime NULL, \`fecha_terminado\` datetime NULL, \`id_asesoramiento\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`guia\` (\`id\` int NOT NULL AUTO_INCREMENT, \`titulo\` varchar(255) NOT NULL, \`descripcion\` varchar(255) NOT NULL, \`url_imagen\` varchar(255) NOT NULL, \`doc_url\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`herramienta\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`descripcion\` varchar(255) NOT NULL, \`url_imagen\` varchar(255) NOT NULL, \`enlace\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`noticia\` (\`id\` int NOT NULL AUTO_INCREMENT, \`titulo\` varchar(255) NOT NULL, \`descripcion\` varchar(255) NOT NULL, \`url_imagen\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`solucion\` (\`id\` int NOT NULL AUTO_INCREMENT, \`preguntas\` varchar(255) NOT NULL, \`respuestas\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tutorial\` (\`id\` int NOT NULL AUTO_INCREMENT, \`titulo\` varchar(255) NOT NULL, \`enlace\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`reunion\` (\`id\` int NOT NULL AUTO_INCREMENT, \`titulo\` varchar(255) NOT NULL, \`fecha_reunion\` timestamp NOT NULL, \`estado\` enum ('espera', 'terminado') NOT NULL DEFAULT 'espera', \`enlace_zoom\` varchar(255) NULL, \`zoom_password\` varchar(255) NULL, \`enlace_video\` varchar(255) NULL, \`video_password\` varchar(255) NULL, \`meetingId\` varchar(255) NULL, \`zoomUuid\` varchar(255) NOT NULL, \`fecha_creacion\` timestamp NOT NULL, \`id_asesoramiento\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`soporte\` (\`id\` int NOT NULL AUTO_INCREMENT, \`asunto\` enum ('Error_en_entrega_y_revision', 'Error_en_reuniones', 'Error_en_calendario', 'Error_en_recursos', 'Otro') NOT NULL, \`descripcion\` varchar(255) NOT NULL, \`estado\` enum ('espera', 'finalizado') NOT NULL DEFAULT 'espera', \`fecha_envio\` datetime NOT NULL, \`fecha_revision\` datetime NULL, \`id_cliente\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`admin\` ADD CONSTRAINT \`FK_d6655cf5853701ab8ac2d7d4d35\` FOREIGN KEY (\`usuarioId\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pago\` ADD CONSTRAINT \`FK_6d27019b9d8ee3c2a2bd5cff213\` FOREIGN KEY (\`id_informacion_pago\`) REFERENCES \`informacion_pagos\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`informacion_pagos\` ADD CONSTRAINT \`FK_15ac0b8eeb544b1a4b1fedcb162\` FOREIGN KEY (\`id_asesoramiento\`) REFERENCES \`asesoramiento\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` ADD CONSTRAINT \`FK_6e9597d7abfb30df60996e0ab8b\` FOREIGN KEY (\`id_tipo_trabajo\`) REFERENCES \`tipo_trabajo\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` ADD CONSTRAINT \`FK_dfe1c20580248b8d9ce30a9f195\` FOREIGN KEY (\`id_contrato\`) REFERENCES \`tipo_contrato\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`procesos_asesoria\` ADD CONSTRAINT \`FK_94f8df2aa71583b6dfc0e744872\` FOREIGN KEY (\`id_cliente\`) REFERENCES \`cliente\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`procesos_asesoria\` ADD CONSTRAINT \`FK_51cbc8ccb27cc92c4e568ab0b1e\` FOREIGN KEY (\`id_asesor\`) REFERENCES \`asesor\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`procesos_asesoria\` ADD CONSTRAINT \`FK_2508fd0e83ca43195700c4c5672\` FOREIGN KEY (\`id_asesoramiento\`) REFERENCES \`asesoramiento\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cliente\` ADD CONSTRAINT \`FK_3fdf25081e2ee383721afc625d2\` FOREIGN KEY (\`id_grado_academico\`) REFERENCES \`grado_academico\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cliente\` ADD CONSTRAINT \`FK_26eb6132b607fd16d904df0367d\` FOREIGN KEY (\`usuarioId\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`asesor\` ADD CONSTRAINT \`FK_31c3d36ed1fd055597ab389da36\` FOREIGN KEY (\`id_area\`) REFERENCES \`area_asesor\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`asesor\` ADD CONSTRAINT \`FK_cc2a52d979ab00d8b94b3a8d9ed\` FOREIGN KEY (\`id_grado_academico\`) REFERENCES \`grado_academico\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`asesor\` ADD CONSTRAINT \`FK_285f003441aa6855dc95f4c7b83\` FOREIGN KEY (\`usuarioId\`) REFERENCES \`usuarios\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`documento\` ADD CONSTRAINT \`FK_a549abd88ad576aa9b315a56725\` FOREIGN KEY (\`id_asunto\`) REFERENCES \`asunto\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`asunto\` ADD CONSTRAINT \`FK_d94dbc00a1ba0f63437a4c08314\` FOREIGN KEY (\`id_asesoramiento\`) REFERENCES \`asesoramiento\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reunion\` ADD CONSTRAINT \`FK_c571dc653fcb46e946ed80121d9\` FOREIGN KEY (\`id_asesoramiento\`) REFERENCES \`asesoramiento\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`soporte\` ADD CONSTRAINT \`FK_ff56ee8ac6c4a2dfa4b6e7cfa5f\` FOREIGN KEY (\`id_cliente\`) REFERENCES \`cliente\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`soporte\` DROP FOREIGN KEY \`FK_ff56ee8ac6c4a2dfa4b6e7cfa5f\``);
        await queryRunner.query(`ALTER TABLE \`reunion\` DROP FOREIGN KEY \`FK_c571dc653fcb46e946ed80121d9\``);
        await queryRunner.query(`ALTER TABLE \`asunto\` DROP FOREIGN KEY \`FK_d94dbc00a1ba0f63437a4c08314\``);
        await queryRunner.query(`ALTER TABLE \`documento\` DROP FOREIGN KEY \`FK_a549abd88ad576aa9b315a56725\``);
        await queryRunner.query(`ALTER TABLE \`asesor\` DROP FOREIGN KEY \`FK_285f003441aa6855dc95f4c7b83\``);
        await queryRunner.query(`ALTER TABLE \`asesor\` DROP FOREIGN KEY \`FK_cc2a52d979ab00d8b94b3a8d9ed\``);
        await queryRunner.query(`ALTER TABLE \`asesor\` DROP FOREIGN KEY \`FK_31c3d36ed1fd055597ab389da36\``);
        await queryRunner.query(`ALTER TABLE \`cliente\` DROP FOREIGN KEY \`FK_26eb6132b607fd16d904df0367d\``);
        await queryRunner.query(`ALTER TABLE \`cliente\` DROP FOREIGN KEY \`FK_3fdf25081e2ee383721afc625d2\``);
        await queryRunner.query(`ALTER TABLE \`procesos_asesoria\` DROP FOREIGN KEY \`FK_2508fd0e83ca43195700c4c5672\``);
        await queryRunner.query(`ALTER TABLE \`procesos_asesoria\` DROP FOREIGN KEY \`FK_51cbc8ccb27cc92c4e568ab0b1e\``);
        await queryRunner.query(`ALTER TABLE \`procesos_asesoria\` DROP FOREIGN KEY \`FK_94f8df2aa71583b6dfc0e744872\``);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` DROP FOREIGN KEY \`FK_dfe1c20580248b8d9ce30a9f195\``);
        await queryRunner.query(`ALTER TABLE \`asesoramiento\` DROP FOREIGN KEY \`FK_6e9597d7abfb30df60996e0ab8b\``);
        await queryRunner.query(`ALTER TABLE \`informacion_pagos\` DROP FOREIGN KEY \`FK_15ac0b8eeb544b1a4b1fedcb162\``);
        await queryRunner.query(`ALTER TABLE \`pago\` DROP FOREIGN KEY \`FK_6d27019b9d8ee3c2a2bd5cff213\``);
        await queryRunner.query(`ALTER TABLE \`admin\` DROP FOREIGN KEY \`FK_d6655cf5853701ab8ac2d7d4d35\``);
        await queryRunner.query(`DROP TABLE \`soporte\``);
        await queryRunner.query(`DROP TABLE \`reunion\``);
        await queryRunner.query(`DROP TABLE \`tutorial\``);
        await queryRunner.query(`DROP TABLE \`solucion\``);
        await queryRunner.query(`DROP TABLE \`noticia\``);
        await queryRunner.query(`DROP TABLE \`herramienta\``);
        await queryRunner.query(`DROP TABLE \`guia\``);
        await queryRunner.query(`DROP TABLE \`asunto\``);
        await queryRunner.query(`DROP TABLE \`documento\``);
        await queryRunner.query(`DROP INDEX \`REL_285f003441aa6855dc95f4c7b8\` ON \`asesor\``);
        await queryRunner.query(`DROP TABLE \`asesor\``);
        await queryRunner.query(`DROP TABLE \`area_asesor\``);
        await queryRunner.query(`DROP TABLE \`grado_academico\``);
        await queryRunner.query(`DROP INDEX \`REL_26eb6132b607fd16d904df0367\` ON \`cliente\``);
        await queryRunner.query(`DROP TABLE \`cliente\``);
        await queryRunner.query(`DROP TABLE \`procesos_asesoria\``);
        await queryRunner.query(`DROP TABLE \`asesoramiento\``);
        await queryRunner.query(`DROP TABLE \`informacion_pagos\``);
        await queryRunner.query(`DROP TABLE \`pago\``);
        await queryRunner.query(`DROP TABLE \`tipo_trabajo\``);
        await queryRunner.query(`DROP TABLE \`tipo_contrato\``);
        await queryRunner.query(`DROP INDEX \`REL_d6655cf5853701ab8ac2d7d4d3\` ON \`admin\``);
        await queryRunner.query(`DROP TABLE \`admin\``);
        await queryRunner.query(`DROP TABLE \`usuarios\``);
    }

}
