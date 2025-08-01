import { Test, TestingModule } from '@nestjs/testing';
import { AsesoramientoController } from './asesoramiento.controller';
import { AsesoramientoService } from './asesoramiento.service';

describe('AsesoramientoController', () => {
  let controller: AsesoramientoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsesoramientoController],
      providers: [AsesoramientoService],
    }).compile();

    controller = module.get<AsesoramientoController>(AsesoramientoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
