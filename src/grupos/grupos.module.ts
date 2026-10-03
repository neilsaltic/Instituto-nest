import { Module } from '@nestjs/common';
import { GruposService } from './grupos.service.js';
import { GruposController } from './grupos.controller.js';

@Module({
  controllers: [GruposController],
  providers: [GruposService],
})
export class GruposModule {}
