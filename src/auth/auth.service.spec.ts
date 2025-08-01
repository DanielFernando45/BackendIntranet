// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthService } from './auth.service';

// describe('AuthService', () => {
//   let service: AuthService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [AuthService],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });

// auth.service.spec.ts
// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthService } from './auth.service';
// import { JwtService } from '@nestjs/jwt';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Usuario } from '../usuario/usuario.entity';
// import { Admin } from '../admin/admin.entity';
// import { Asesor } from '../asesor/asesor.entity';
// import { Cliente } from '../cliente/cliente.entity';
// import { UnauthorizedException } from '@nestjs/common';
// import * as bcrypt from 'bcrypt';

// describe('AuthService', async() => {
//   let service: AuthService;

//   const mockUser = {
//     id: 1,
//     username: 'testuser',
//     password: await bcrypt.hash('password123', 10),
//     role: 'admin',
//   };

//   const mockUsuarioRepo = {
//     findOneBy: jest.fn().mockResolvedValue(mockUser),
//   };

//   const mockAdminRepo = {
//     findOne: jest.fn().mockResolvedValue({ id: 1, nombre: 'Admin Nombre', usuario: mockUser }),
//   };

//   const mockJwtService = {
//     sign: jest.fn().mockReturnValue('mocked.jwt.token'),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthService,
//         { provide: getRepositoryToken(Usuario), useValue: mockUsuarioRepo },
//         { provide: getRepositoryToken(Admin), useValue: mockAdminRepo },
//         { provide: getRepositoryToken(Asesor), useValue: {} },
//         { provide: getRepositoryToken(Cliente), useValue: {} },
//         { provide: JwtService, useValue: mockJwtService },
//       ],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//   });

//   describe('validateUser', () => {
//     it('retorna el usuario si las credenciales son válidas', async () => {
//       jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
//       const result = await service.validateUser('testuser', 'password123');
//       expect(result).toEqual(mockUser);
//     });

//     it('lanza error si el usuario no existe', async () => {
//       mockUsuarioRepo.findOneBy.mockResolvedValue(null);
//       await expect(service.validateUser('baduser', 'any')).rejects.toThrow(UnauthorizedException);
//     });

//     it('lanza error si la contraseña es incorrecta', async () => {
//       mockUsuarioRepo.findOneBy.mockResolvedValue(mockUser);
//       jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
//       await expect(service.validateUser('testuser', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
//     });
//   });

//   describe('login', () => {
//     it('devuelve token y datos de usuario si es admin', async () => {
//       const result = await service.login(mockUser);
//       expect(result).toEqual({
//         access_token: 'mocked.jwt.token',
//         id_usuario: mockUser.id,
//         datos_usuario: {
//           id: 1,
//           nombre: 'Admin Nombre',
//           role: 'admin',
//         },
//       });
//     });
//   });
// });