import { Module } from '@nestjs/common';
import { MateriasService } from './materias.service.js';
import { MateriasController } from './materias.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [MateriasController],
  providers: [MateriasService],
})
export class MateriasModule {}
