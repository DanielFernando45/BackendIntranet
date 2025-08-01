import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';

export class Registros1746554350124 implements MigrationInterface {
  name="Registros1746554350124"

     public async up(queryRunner: QueryRunner): Promise<void> {
          const usuarios = [
            { id: 1, dni: 12345678, correo: "juantinoco23@gmail.com", role: "estudiante", nombre: "Juan Carlos", apellido: "Tinoco Ramírez", telefono: 12345678, universidad: "UNMSM", grado: 1, carrera: "Derecho" },
            { id: 2, dni: 4567890, correo: "gabrielv45@gmail.com", role: "estudiante", nombre: "Gabriel Alejandro", apellido: "Vargas León", telefono: 98982131, universidad: "UNI", grado: 2, carrera: "Ingeniería de Sistemas" },
            { id: 3, dni: 11223344, correo: "lauraq92@gmail.com", role: "estudiante", nombre: "Laura Daniela", apellido: "Quispe Torres", telefono: 99887766, universidad: "PUCP", grado: 2, carrera: "Arquitectura" },
            { id: 4, dni: 22334455, correo: "carlosmendez90@gmail.com", role: "estudiante", nombre: "Carlos Enrique", apellido: "Méndez Suárez", telefono: 98765432, universidad: "UNI", grado: 3, carrera: "Ingeniería Electrónica" },
            { id: 5, dni: 33445566, correo: "vanesalopez@gmail.com", role: "estudiante", nombre: "Vanesa María", apellido: "López Gutiérrez", telefono: 97654321, universidad: "UNFV", grado: 1, carrera: "Educación Secundaria" },
            { id: 6, dni: 55667788, correo: "marianagomez12@gmail.com", role: "estudiante", nombre: "Mariana Sofía", apellido: "Gómez Rojas", telefono: 94567231, universidad: "UPC", grado: 3, carrera: "Administración de Empresas" },
            { id: 7, dni: 66778899, correo: "ricardoalvarez90@gmail.com", role: "estudiante", nombre: "Ricardo Esteban", apellido: "Álvarez Paredes", telefono: 93214567, universidad: "USIL", grado: 2, carrera: "Marketing" },
            { id: 8, dni: 77889900, correo: "florenciaavila21@gmail.com", role: "estudiante", nombre: "Florencia Isabel", apellido: "Ávila Mendoza", telefono: 98712345, universidad: "UNMSM", grado: 1, carrera: "Psicología" },
            { id: 9, dni: 88990011, correo: "andresmora23@gmail.com", role: "estudiante", nombre: "Andrés Felipe", apellido: "Mora Castillo", telefono: 93456782, universidad: "UTP", grado: 2, carrera: "Ingeniería Industrial" },
            { id: 10, dni: 99001122, correo: "melissaruiz18@gmail.com", role: "estudiante", nombre: "Melissa Andrea", apellido: "Ruiz Delgado", telefono: 94821345, universidad: "UNMSM", grado: 3, carrera: "Medicina Humana" },
          ];
      
          const asesores = [
            { id: 11, dni: 70000312, correo: "Solis_Diana11@gmail.com",role:"asesor", nombre: "Diana Alexandra", apellido: "Solis Rios", telefono: 958309003, area: 3, grado: 4, especialidad: "Gestion de los servicios de la salud", universidad: "Universidad Cesar Vallejo" },
            { id: 12, dni: 75834615, correo: "Victor_Avendaño12@gmail.com",role:"asesor",nombre:"Victor Alfonso", apellido: "Avendaño Jave", telefono: 933014331, area: 5, grado: 4, especialidad: "Maestria en derecho civil", universidad: "Universidad Privada Norbert Wiener" },
            { id: 13, dni: 75359423, correo: "Olenka_Meza13@gmail.com", role:"asesor",nombre: "Olenka Ethel", apellido: "Mogrovejo Meza", telefono: 967499479, area: 4, grado: 3, especialidad: "Ingenieria Industrial", universidad: "Universidad Cesar Vallejo" },
            { id: 14, dni: 74569542, correo: "grecia_salazar14@gmail.com", role:"asesor",nombre: "Grecia Alexi Fernanda", apellido: "Salazar Valera", telefono: 926530923, area: 1, grado: 3, especialidad: "Contadoria Publica", universidad: "Universidad Cesar Vallejo" },
            { id: 15, dni: 75082592, correo: "brenda_lucia15@gmail.com", role:"asesor",nombre: "Brenda Lucia", apellido: "Castillo Rodriguez", telefono: 917732296, area: 1, grado: 3, especialidad: "Linguistica", universidad: "Universidad nacional Federico Villareal" },
            { id: 16, dni: 72729085, correo: "Roman_Solano16@gmail.com", role:"asesor",nombre: "Israel Anthony", apellido: "Roman Solano", telefono: 994195709, area: 3, grado: 3, especialidad: "Psicologia", universidad: "Universidad Nacional Mayor de San marcos" },
            { id: 17, dni: 72951640, correo: "Daniel_Emmerson17@gmail.com", role:"asesor",nombre: "Daniel Emmerson", apellido: "Dominguez Lope", telefono: 977587126, area: 1, grado: 3, especialidad: "Economia publica", universidad: "Universidad Nacional Mayor de San marcos" },
            { id: 18, dni: 76087518, correo: "Emmanuel_Flores18@gmail.com", role:"asesor",nombre: "Emanuel Oswaldo", apellido: "Flores Utos", telefono: 937213818, area: 4, grado: 4, especialidad: "Gestion publica", universidad: "Universidad San Ignacio de Loyola" },
            { id: 19, dni: 46540926, correo: "Heredia_Lidia19@gmail.com", role:"asesor",nombre: "Lidia Balbina", apellido: "Heredia Falla", telefono: 940154863, area: 2, grado: 3, especialidad: "Psicologia", universidad: "Universidad Cesar Vallejo" },
            { id: 20, dni: 71980097, correo: "Salazar_Nieto@gmail.com", role:"asesor",nombre: "Haider Dante", apellido: "Salazar Nieto", telefono: 903038968, area: 4, grado: 3, especialidad: "Ingenieria Electronica", universidad: "Universidad Tecnologica del Peru" }
          ];
      
          const admins = [
            { id: 21, dni: 45475734, correo: "moreno_karen21@gmail.com",role:"admin", nombre: "Karen Moreno" },
            { id: 22, dni: 12131415, correo: "sofiaram@gmail.com",role:"admin", nombre: "Sofía Ramírez" },
            { id: 23, dni: 13141516, correo: "ernestou@gmail.com",role:"admin", nombre: "Ernesto Ulloa" }
          ];
      
    
        // Insert datos básicos
        await queryRunner.query(`
            INSERT INTO Alejandria.tipo_trabajo (id, nombre) VALUES 
              (1, 'Proyecto bachillerato'),
              (2, 'Tesis Pregrado'),
              (3, 'Tesis'),
              (4, 'Tesis Maestria'),
              (5, 'Tesis Doctorado'),
              (6, 'Plan de negocio'),
              (7, 'Revision sistematica'),
              (8, 'Articulo cientifico'),
              (9, 'Estudio de prefactibilidad'),
              (10, 'Suficiencia personal');
          `);
          
          await queryRunner.query(`
            INSERT INTO Alejandria.grado_academico (id, nombre) VALUES 
              (1, 'Estudiante Pregrado'),
              (2, 'Bachiller'),
              (3, 'Licenciado'),
              (4, 'Maestria'),
              (5, 'Doctorado');
          `);
          
          await queryRunner.query(`
            INSERT INTO Alejandria.area_asesor (id, nombre) VALUES 
              (1, 'Negocio'),
              (2, 'Social'),
              (3, 'Salud'),
              (4, 'Ingenieria'),
              (5, 'Legal');
          `);
          
          await queryRunner.query(`
            INSERT INTO Alejandria.tipo_contrato (id, nombre, tipo_contrato, tipo_entrega, modalidad) VALUES 
              (1, 'Contado/Avance/Individual', 'contado', 'avance', 'individual'),
              (2, 'Contado/Plazo/Individual', 'contado', 'plazo', 'individual'),
              (3, 'Contado/Avance/Grupal', 'contado', 'avance', 'grupal'),
              (4, 'Contado/Plazo/Grupal', 'contado', 'plazo', 'grupal'),
              (5, 'Cuotas/Avance/Individual', 'cuotas', 'avance', 'individual'),
              (6, 'Cuotas/Plazo/Individual', 'cuotas', 'plazo', 'individual'),
              (7, 'Cuotas/Avance/Grupal', 'cuotas', 'avance', 'grupal'),
              (8, 'Cuotas/Plazo/Grupal', 'cuotas', 'plazo', 'grupal');
          `);
    
          for (const u of [...usuarios, ...asesores, ...admins]) {
            const hashed = await bcrypt.hash(`${u.dni}`, 10);
            await queryRunner.query(`
              INSERT INTO Alejandria.usuarios (id, username, password, role, estado)
              VALUES (${u.id}, '${u.correo}', '${hashed}', '${u.role || (u.nombre.includes("Ramírez") ? 'admin' : 'asesor')}', 1);
            `);
          }
    
         // Insertar clientes
         for (const c of usuarios) {
          await queryRunner.query(`
            INSERT INTO Alejandria.cliente (
              dni, nombre, apellido, telefono, email, url_imagen, pais, universidad,
               id_grado_academico,carrera, usuarioId
            ) VALUES (
              ${c.dni}, '${c.nombre}', '${c.apellido}', ${c.telefono}, '${c.correo}',
              'http://downloader/api/users/photos', 'Peru', '${c.universidad}',
               ${c.grado},'${c.carrera}', ${c.id}
            );
          `);
        }
          
        // Insertar asesores
        for (const a of asesores) {
          await queryRunner.query(`
            INSERT INTO Alejandria.asesor (
              dni, nombre, apellido, email, telefono, url_imagen, especialidad,
              universidad, id_area, id_grado_academico, usuarioId
            ) VALUES (
              ${a.dni}, '${a.nombre}', '${a.apellido}', '${a.correo}', ${a.telefono},
              'http://worlwide/images/person${a.id}', '${a.especialidad}',
              '${a.universidad}', ${a.area}, ${a.grado}, ${a.id}
            );
          `);
        }
        for (const a of admins) {
          await queryRunner.query(`
            INSERT INTO Alejandria.admin (nombre, email, dni, usuarioId)
            VALUES ('${a.nombre}', '${a.correo}', '${a.dni}', ${a.id});
          `);
        }
    
            // Insertar asesoramiento
            await queryRunner.query(`
                INSERT INTO Alejandria.asesoramiento (id, profesion_asesoria,especialidad,tipo_servicio,id_tipo_trabajo,id_contrato,estado, fecha_inicio, fecha_fin) VALUES 
                (1, 'Investigacion Sistema tributario','Administracion tributaria','proyecto',3,1,'activo', '2025-04-01 08:00:00', '2025-04-30 17:00:00'),
                (2, 'Trabajo Ingenieria Industrial','Magister en Ingenieria Industrial','completo',3,5,'activo','2025-05-11 09:00:00','2025-09-16 08:00:00');
            `);
      
            // Insertar proceso de asesoría vinculando al cliente y al asesor
            await queryRunner.query(`
                INSERT INTO Alejandria.procesos_asesoria (id, id_cliente, id_asesor,id_asesoramiento,esDelegado) VALUES 
                (1, 1, 1, 1,1),
                (2, 2, 1, 1,0);
            `);
            await queryRunner.query(`
                INSERT INTO Alejandria.procesos_asesoria (id, id_cliente, id_asesor,id_asesoramiento,esDelegado) VALUES 
                (3, 3, 2, 2,1),
                (4, 1, 2, 2,0),
                (5, 2, 2, 2,0),
                (6, 4, 2, 2,0);
            `);
            await queryRunner.query(`
                INSERT INTO Alejandria.asunto (id,titulo, estado, fecha_entregado, fecha_revision, fecha_terminado, id_asesoramiento)
                VALUES
                (1,'Revisado Avance 1', 'terminado', '2025-05-01 10:00:00', '2025-05-06 13:45:00', '2025-05-14 16:00:00', 1),
                (2,'Correcion parcial', 'proceso', '2025-05-10 09:00:00', '2025-05-10 14:00:00', '2025-05-15 14:00:00', 1),
                (3,'Entrega Final', 'entregado', '2025-05-20 11:30:00', NULL , NULL , 1);
            `);
            await queryRunner.query(`
                INSERT INTO Alejandria.asunto (id,titulo, estado, fecha_entregado, fecha_revision, fecha_terminado, id_asesoramiento)
                VALUES
                (4,'Revision Antecedentes', 'terminado', '2025-05-02 10:00:00', '2025-05-04 13:45:00', '2025-05-10 16:00:00', 2),
                (5,'Correcion Justificacion', 'proceso', '2025-05-11 09:00:00', '2025-05-12 14:00:00', '2025-05-15 14:00:00', 2),
                (6,'Entrega de objetivos', 'entregado', '2025-05-22 11:30:00', NULL , NULL , 2),
                (7,'Entrega de metodologia', 'entregado', '2025-05-23 11:30:00', NULL , NULL , 2);
            `);
            //Documentos
            await queryRunner.query(`
                INSERT INTO Alejandria.documento(id,nombre, ruta, subido_por, created_at, id_asunto)
                VALUES
                (1,'Introduccion.docx','documentos/1751557549104-TRABAJOINDIVIDUAL_1748533065552.docx','estudiante','2025-05-01 10:00:00',1),
                (2,'Justificacion.pdf','documentos/1751560728723-Downloads.rar','estudiante','2025-05-01 10:00:00',1),
                (3,'Antecedentes.xslx','documentos/1751557549104-TRABAJOINDIVIDUAL_1748533065552.docx','estudiante','2025-05-02 10:00:00',4),
                (4,'Tesis_parcial.mp4','documentos/1751558207347-Alternativas-de-Seguridad-para-eCommerce-Samsung.pptx','estudiante','2025-05-10 09:00:00',2),
                (6,'Justificacion_Corregida.jpeg','documentos/1751560819207-reunion-de-asesores-juridicos.jpeg','estudiante','2025-05-11 09:00:00',5),
                (7,'Revision_Introduccion.png','documentos/1751558207347-Alternativas-de-Seguridad-para-eCommerce-Samsung.pptx','asesor','2025-05-14 16:00:00',1),
                (8,'Revision_Justificacion.webp','documentos/1751557549104-TRABAJOINDIVIDUAL_1748533065552.docx','asesor','2025-05-14 16:00:00',1),
                (9,'Documento_Final.gif','documentos/1751560819207-reunion-de-asesores-juridicos.jpeg','estudiante','2025-05-20 11:30:00',3),
                (10,'Objetivos_Generales.rar','documentos/1751558207347-Alternativas-de-Seguridad-para-eCommerce-Samsung.pptx','estudiante','2025-05-22 11:30:00',6),
                (11,'Objetivos_Especificos.zip','documentos/1751557549104-TRABAJOINDIVIDUAL_1748533065552.docx','estudiante','2025-05-22 11:30:00',6),
                (12,'Metodologia_1ra_parte.7z', 'documentos/1751558207347-Alternativas-de-Seguridad-para-eCommerce-Samsung.pptx','estudiante','2025-05-23 11:30:00',7),
                (13,'Entrega_Metodologia_v2.pdf','documentos/1751560728723-Downloads.rar','estudiante','2025-05-23 11:30:00',7),
                (14,'Metricas_Metodologia.docx','documentos/1751557549104-TRABAJOINDIVIDUAL_1748533065552.docx','estudiante','2025-05-23 11:30:00',7);
            `);

            await queryRunner.query(`
                INSERT INTO Alejandria.informacion_pagos(id,titulo,pago_total,tipo_pago,tipo_servicio,numero_cuotas,fecha_creado,id_asesoramiento)
                VALUES
                (1,"Pago por cuotas",1200,"cuotas","asesoria",3,"2025-05-12 12:00:00",1),
                (2,"Pago total",1000,"contado","asesoria",1,"2025-06-15 10:00:00",2),
                (3,"Sericio Revision completo",1100,"contado","otros",1,"2025-06-24 10:00:00",2),
                (4,"Servicio Turnitin",70,"contado","otros",1,"2025-06-11 10:00:00",1);
                `);
                //(5,"Pago total",1050,"contado","asesoria",1,"2025-06-22 10:00:00",1);
                
            await queryRunner.query(`
                INSERT INTO Alejandria.pago(id,nombre,monto,fecha_pago,estado_pago,id_informacion_pago)
                VALUES
                (1,"Cuota 1",500,"2025-05-12 13:21:00","pagado",1),
                (2,"Cuota 2",400,"2025-06-13 13:10:00","pagado",1),
                (3,"Cuota 3",300,null,"por_pagar",1),
                (4,"Pago total",1000,"2025-06-14 11:00:00","pagado",2),
                (5,"Sericio Revision completo",1100,"2025-06-23 10:00:00","pagado",3),
                (6,"Servicio turnitin",70,"2025-06-10 12:24:10","pagado",4);
                `)
                //(6,"Cuota 2",500,null,"por_pagar",3),
                //(8,"Pago total",1200,"2025-06-21 11:23:22","pagado",5); 
                await queryRunner.query(`
              INSERT INTO Alejandria.reunion(
                  id, titulo, fecha_reunion, estado, enlace_zoom, zoom_password,
                  enlace_video, video_password, meetingId, zoomUuid, fecha_creacion, id_asesoramiento
              )
              VALUES
              (1, 'Reunión inicial', '2025-06-01 10:00:00', 'espera', 'https://zoom.us/j/2134423qe2', '3443242',
                  NULL, NULL, '4532498', '4jt4n644', '2025-05-28 09:00:00', 1),
              (2, 'Seguimiento 1', '2025-06-08 11:00:00', 'terminado', 'https://zoom.us/j/56ytdsfd454', '2543662',
                  'https://zoom.us/recording/1fe23442', '876465', '21232141', '4hth34231', '2025-05-30 15:00:00', 1),
              (3, 'Reunión asesoramiento', '2025-06-15 12:00:00', 'espera', 'https://zoom.us/j/42523243def', '8324972',
                  NULL, NULL, '5634234', '43n5o345n1', '2025-06-01 17:30:00', 2),
              (4, 'Asesoría técnica', '2025-06-20 14:30:00', 'terminado', 'https://zoom.us/j/34ygh2h2567', '9896644',
                  'https://zoom.us/recording/384fh0310', '4832091', '91232819', 'gf7x8f8gx62', '2025-06-10 10:00:00', 2);
            `);

            await queryRunner.query(`
              INSERT INTO Alejandria.herramienta(id,nombre,descripcion,url_imagen,enlace)
              VALUES
              (1, 'Python', 'Python en una herramienta indispensable en el entorno de datos', 'herramientas/1751556432230-docker.jpg', 'https://www.python.org'),
              (2, 'Grammarly', 'Asistente de escritura para corrección gramatical y estilo.', 'herramientas/1751555803727-gato png.pngg', 'https://www.grammarly.com'),
              (3, 'Zotero', 'Gestor de referencias bibliográficas y recursos académicos.', 'herramientas/1751556432230-docker.jpg', 'https://www.zotero.org'),
              (4, 'Mendeley', 'Organizador de investigaciones y gestor de referencias.', 'herramientas/1751555803727-gato png.png', 'https://www.mendeley.com'),
              (5, 'Notion', 'Aplicación para tomar notas, organizar tareas y trabajo colaborativo.', 'herramientas/1751556432230-docker.jpg', 'https://www.notion.so');
            `)

            await queryRunner.query(`
              INSERT INTO Alejandria.guia(id, titulo, descripcion, url_imagen, doc_url)
              VALUES
                (1, 'Guía de Normas APA', 'Instrucciones para citar y referenciar con el formato APA.', 'guias/1751392571185-gato jpeg.jpg', 'guias/1751475279015-SPRINGS BACKEND.xlsx'),
                (2, 'Guía de Tesis', 'Pasos y estructura para elaborar una tesis universitaria.', 'guias/1751395426554-normas-apa.jpg', 'guias/1751475206320-00500751048IS10S11120419SESION9(2).pptx'),
                (3, 'Guía de Turnitin', 'Manual para el uso correcto de Turnitin.', 'guias/1751472102002-gato webp.webp', 'guias/1751475279015-SPRINGS BACKEND.xlsx'),
                (4, 'Guía de Presentaciones', 'Consejos para realizar presentaciones efectivas.', 'guias/1751470518112-Modelado de BD 1.6.jpg', 'guias/1751475206320-00500751048IS10S11120419SESION9(2).pptx'),
                (5, 'Guía de Investigación', 'Orientaciones para la planificación y ejecución de investigaciones.', 'guias/1751393134168-leon.jpg', 'guias/1751475279015-SPRINGS BACKEND.xlsx');  
            `)

            await queryRunner.query(`
              INSERT INTO Alejandria.noticia(id, titulo, descripcion, url_imagen)
              VALUES
                (1, 'Nuevo convenio con universidades internacionales', 'Se ha firmado un acuerdo de colaboración con instituciones académicas extranjeras para fomentar el intercambio estudiantil.', 'noticias/1751556041292-reunion asesores.webp'),
                (2, 'Concurso de investigación 2025', 'Abierta la convocatoria para el concurso anual de investigación. Participa y gana premios.', 'noticias/1751556041292-reunion asesores.webp'),
                (3, 'Actualización en el reglamento de tesis', 'La universidad ha publicado cambios importantes en el reglamento para trabajos de titulación.', 'noticias/1751556041292-reunion asesores.webp'),
                (4, 'Webinar sobre redacción académica', 'Este 30 de junio se llevará a cabo un webinar gratuito sobre técnicas de redacción para tesis.', 'noticias/1751556041292-reunion asesores.webp'),
                (5, 'Nuevo portal de biblioteca digital', 'Accede a miles de libros y revistas académicas desde cualquier lugar con el nuevo portal.', 'noticias/1751556041292-reunion asesores.webp');
            `);
            await queryRunner.query(`
              INSERT INTO Alejandria.solucion(id, preguntas, respuestas)
              VALUES
                (1, '¿Cómo puedo acceder al sistema de gestión académica?', 'Debes ingresar con tu usuario institucional en https://AlejandriaIntranet.edu.pe'),
                (2, '¿Dónde encuentro ejemplos de tesis aprobadas?', 'En la biblioteca digital o en la sección de recursos del portal académico.'),
                (3, '¿Qué formato debo usar para entregar mi tesis?', 'El formato requerido es PDF en letra Times New Roman, tamaño 12, con interlineado 1.5.'),
                (4, '¿Cómo solicito un asesor académico?', 'Debes llenar el formulario disponible en la plataforma y esperar la asignación.'),
                (5, '¿Puedo entregar mi tesis después del plazo?', 'Solo con una justificación válida y autorización de la coordinación académica.');
            `);
            await queryRunner.query(`
              INSERT INTO Alejandria.tutorial(id, titulo, enlace)
              VALUES
                (1, 'Cómo registrar tu tesis en línea', 'https://www.youtube.com/watch?v=Fe4AK7Cmxdc'),
                (2, 'Uso básico de Turnitin', 'https://www.youtube.com/watch?v=JIni_yDo5pg'),
                (3, 'Gestión de referencias con Zotero', 'https://www.youtube.com/watch?v=9GUWKEsC_ls'),
                (4, 'Normas APA', 'https://www.youtube.com/watch?v=ATqDrQv71ps'),
                (5, '¿Que es LateX?', 'https://www.youtube.com/watch?v=bOIQ5Uphz6Y&t=21s');
            `);

            await queryRunner.query(`
              INSERT INTO Alejandria.soporte(
                id, asunto, descripcion, estado, fecha_envio, fecha_revision, id_cliente
              )
              VALUES
                (1, 'Error_en_entrega_y_revision', 'No puedo subir mi archivo final a la plataforma.', 'espera', '2025-06-01 10:30:00', NULL, 1),
                (2, 'Error_en_reuniones', 'Mi reunión no fue registrada en el sistema.', 'finalizado', '2025-06-03 12:45:00', '2025-06-05 09:00:00', 2),
                (3, 'Error_en_calendario', 'Las fechas del calendario académico no coinciden con las asignadas.', 'espera', '2025-06-07 14:15:00', NULL, 3),
                (4, 'Error_en_recursos', 'No tengo acceso a los recursos del módulo 3.', 'finalizado', '2025-06-08 16:00:00', '2025-06-10 10:30:00', 4),
                (5, 'Otro', 'Tengo dudas sobre el proceso de titulación.', 'espera', '2025-06-10 11:20:00', NULL, 5);
            `);
        }
    
        public async down(queryRunner: QueryRunner): Promise<void> {

          await queryRunner.query(`DELETE FROM Alejandria.documento WHERE id IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14)`);

          await queryRunner.query(`DELETE FROM Alejandria.asunto WHERE id IN (1,2,3,4,5,6,7)`);

          await queryRunner.query(`DELETE FROM Alejandria.pago WHERE id IN (1,2,3,4,5,6,7,8)`);

          await queryRunner.query(`DELETE FROM Alejandria.informacion_pagos WHERE id IN (1,2,3,4,5)`);

          await queryRunner.query(`DELETE FROM Alejandria.reunion WHERE id IN (1,2,3,4)`);

          await queryRunner.query(`DELETE FROM Alejandria.herramienta WHERE id IN (1,2,3,4,5)`);

          await queryRunner.query(`DELETE FROM Alejandria.guia WHERE id IN (1,2,3,4,5)`);

          await queryRunner.query(`DELETE FROM Alejandria.noticia WHERE id IN (1,2,3,4,5)`);

          await queryRunner.query(`DELETE FROM Alejandria.solucion WHERE id IN (1,2,3,4,5)`);

          await queryRunner.query(`DELETE FROM Alejandria.tutorial WHERE id IN (1,2,3,4,5)`);

          await queryRunner.query(`DELETE FROM Alejandria.soporte WHERE id IN (1,2,3,4,5)`);

          await queryRunner.query(`DELETE FROM Alejandria.procesos_asesoria WHERE id IN (1,2,3,4,5,6)`);
    
          // Eliminar asesoramientos
          await queryRunner.query(`DELETE FROM Alejandria.asesoramiento WHERE id IN (1,2)`);
        
          // Eliminar registros de admin
          await queryRunner.query(`DELETE FROM Alejandria.admin WHERE usuarioId IN (21, 22, 23)`);
        
          // Eliminar registros de asesor
          await queryRunner.query(`DELETE FROM Alejandria.asesor WHERE usuarioId IN (11, 12, 13, 14,15,16,17,18,19,20)`);
        
          // Eliminar registros de cliente
          await queryRunner.query(`DELETE FROM Alejandria.cliente WHERE usuarioId IN (1,2, 3,4, 5, 6, 7, 8, 9, 10)`);
        
          // Eliminar usuarios
          await queryRunner.query(`DELETE FROM Alejandria.usuarios WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)`);
        
          // Eliminar tipo_contrato
          await queryRunner.query(`DELETE FROM Alejandria.tipo_contrato WHERE id IN (1,2,3,4,5,6,7,8)`);
        
          // Eliminar area_asesor
          await queryRunner.query(`DELETE FROM Alejandria.area_asesor WHERE id IN (1, 2, 3, 4, 5)`);
        
          // Eliminar grado_academico
          await queryRunner.query(`DELETE FROM Alejandria.grado_academico WHERE id IN (1, 2, 3, 4, 5)`);
        
          // Eliminar tipo_trabajo
          await queryRunner.query(`DELETE FROM Alejandria.tipo_trabajo WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)`);

          // await queryRunner.query(`DELETE FROM Alejandria.documento WHERE id IN (1,2,3,4,5,6,7,8,9,11,12,13,14)`);

          // await queryRunner.query(`DELETE FROM Alejandria.asunto WHERE id IN (1,2,3,4,5,6,7)`);

          // await queryRunner.query(`DELETE FROM Alejandria.pago WHERE id IN (1,2,3,4,5,6,7,8)`);

          // await queryRunner.query(`DELETE FROM Alejandria.informacion_pagos WHERE id IN (1,2,3,4,5)`);

          // await queryRunner.query(`DELETE FROM Alejandria.reunion WHERE id IN (1,2,3,4)`);

          // await queryRunner.query(`DELETE FROM Alejandria.herramienta WHERE id IN (1,2,3,4,5)`);

          // await queryRunner.query(`DELETE FROM Alejandria.guia WHERE id IN (1,2,3,4,5)`);

          // await queryRunner.query(`DELETE FROM Alejandria.noticia WHERE id IN (1,2,3,4,5)`);

          // await queryRunner.query(`DELETE FROM Alejandria.solucion WHERE id IN (1,2,3,4,5)`);

          // await queryRunner.query(`DELETE FROM Alejandria.tutorial WHERE id IN (1,2,3,4,5)`);

          // await queryRunner.query(`DELETE FROM Alejandria.soporte WHERE id IN (1,2,3,4,5)`);
        }
}
