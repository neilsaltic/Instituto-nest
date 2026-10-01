import { Module } from '@nestjs/common';
import { MatriculasService } from './matriculas.service.js';
import { MatriculasController } from './matriculas.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PagosModule } from '../pagos/pagos.module.js';

@Module({
  imports: [PrismaModule, PagosModule],
  controllers: [MatriculasController],
  providers: [MatriculasService],
  exports: [MatriculasService],
})
export class MatriculasModule {}
