import { Module } from '@nestjs/common';
import { TareasService } from './tareas.service.js';
import { TareasController } from './tareas.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PagosModule } from '../pagos/pagos.module.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  imports: [PrismaModule, PagosModule, CloudinaryModule],
  controllers: [TareasController],
  providers: [TareasService],
  exports: [TareasService],
})
export class TareasModule {}
