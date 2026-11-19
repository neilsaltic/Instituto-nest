import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { GruposService } from './grupos.service.js';

describe('GruposService.obtenerMisGruposEstudiante', () => {
  it('solo consulta grupos del estudiante autenticado en periodos activos', async () => {
    const findUnique = vi.fn().mockResolvedValue({ id: 27 });
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      perfilEstudiante: { findUnique },
      detalleInscripcion: { findMany },
    } as unknown as PrismaService;
    const service = new GruposService(prisma);

    await service.obtenerMisGruposEstudiante(42);

    expect(findUnique).toHaveBeenCalledWith({ where: { usuarioId: 42 } });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          inscripcion: {
            estudiantePerfilId: 27,
            periodo: { activo: true },
          },
        },
      }),
    );
  });

  it('falla explícitamente si el usuario no tiene perfil de estudiante', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const findMany = vi.fn();
    const prisma = {
      perfilEstudiante: { findUnique },
      detalleInscripcion: { findMany },
    } as unknown as PrismaService;
    const service = new GruposService(prisma);

    await expect(service.obtenerMisGruposEstudiante(42)).rejects.toThrow(
      NotFoundException,
    );
    expect(findMany).not.toHaveBeenCalled();
  });
});
