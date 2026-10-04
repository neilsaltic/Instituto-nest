import { Module } from '@nestjs/common';
import { PeriodosService } from './periodos.service.js';
import { PeriodosController } from './periodos.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PeriodosController],
  providers: [PeriodosService],
  exports: [PeriodosService],
})
export class PeriodosModule {}
