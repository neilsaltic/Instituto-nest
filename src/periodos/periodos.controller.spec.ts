import { Test, TestingModule } from '@nestjs/testing';
import { PeriodosController } from './periodos.controller.js';
import { PeriodosService } from './periodos.service.js';

describe('PeriodosController', () => {
  let controller: PeriodosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeriodosController],
      providers: [PeriodosService],
    }).compile();

    controller = module.get<PeriodosController>(PeriodosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
