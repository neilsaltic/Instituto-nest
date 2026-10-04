import { Module } from '@nestjs/common';
import { GruposService } from './grupos.service.js';
import { GruposController } from './grupos.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [GruposController],
  providers: [GruposService],
  exports: [GruposService],
})
export class GruposModule {}
