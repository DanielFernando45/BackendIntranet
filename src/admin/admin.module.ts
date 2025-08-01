import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { Usuario } from '../usuario/usuario.entity';
import { AdminController } from './admin.controller';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[TypeOrmModule.forFeature([Admin,Usuario]),UsuarioModule],
  providers: [AdminService],
  controllers:[AdminController]
})
export class AdminModule {}
