import { Test, TestingModule } from '@nestjs/testing';
import { AsesorController } from './asesor.controller';

describe('AsesorController', () => {
  let controller: AsesorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsesorController],
    }).compile();

    controller = module.get<AsesorController>(AsesorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
