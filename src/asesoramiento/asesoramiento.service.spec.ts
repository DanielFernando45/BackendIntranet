import { Test, TestingModule } from '@nestjs/testing';
import { AsesoramientoService } from './asesoramiento.service';

describe('AsesoramientoService', () => {
  let service: AsesoramientoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsesoramientoService],
    }).compile();

    service = module.get<AsesoramientoService>(AsesoramientoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
