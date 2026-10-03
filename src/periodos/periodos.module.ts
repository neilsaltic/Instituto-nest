import { Module } from '@nestjs/common';
import { PeriodosService } from './periodos.service.js';
import { PeriodosController } from './periodos.controller.js';

@Module({
  controllers: [PeriodosController],
  providers: [PeriodosService],
})
export class PeriodosModule {}
