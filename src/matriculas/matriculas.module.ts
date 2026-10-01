import { Module } from '@nestjs/common';
import { MatriculasService } from './matriculas.service.js';
import { MatriculasController } from './matriculas.controller.js';

@Module({
  controllers: [MatriculasController],
  providers: [MatriculasService],
})
export class MatriculasModule {}
