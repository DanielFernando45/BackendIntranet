import { DataSource } from 'typeorm';
import { Entities } from 'src/entities';
import * as path from 'path';
import { config } from 'dotenv';
// config({ path: path.resolve(__dirname, '../../.env') }); // Ajusta la ruta si es necesario
config()
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

export const AppDataSource = new DataSource({
  logging: ['query', 'error'],
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: Entities,
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // muy importante en producción
});