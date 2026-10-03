import { Injectable } from '@nestjs/common';
import { CreatePeriodoDto } from './dto/create-periodo.dto.js';
import { UpdatePeriodoDto } from './dto/update-periodo.dto.js';

@Injectable()
export class PeriodosService {
  create(createPeriodoDto: CreatePeriodoDto) {
    return 'This action adds a new periodo';
  }

  findAll() {
    return `This action returns all periodos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} periodo`;
  }

  update(id: number, updatePeriodoDto: UpdatePeriodoDto) {
    return `This action updates a #${id} periodo`;
  }

  remove(id: number) {
    return `This action removes a #${id} periodo`;
  }
}
