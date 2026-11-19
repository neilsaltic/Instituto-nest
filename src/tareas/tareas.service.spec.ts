import { describe, expect, it, vi } from 'vitest';
import { PagosService } from '../pagos/pagos.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TareasService } from './tareas.service.js';

describe('TareasService.obtenerEntregasPorTarea', () => {
  it('incluye estudiantes inscritos que todavía no entregaron', async () => {
    const tareaFindFirst = vi.fn().mockResolvedValue({
      grupo: { profesorId: 9, periodoId: 4 },
    });
    const prisma = {
      perfilProfesor: {
        findUnique: vi.fn().mockResolvedValue({ id: 9 }),
      },
      tarea: { findFirst: tareaFindFirst },
      entregaTarea: {
        findMany: vi.fn().mockResolvedValue([
          { estudiantePerfilId: 21, calificacion: null },
        ]),
      },
      detalleInscripcion: {
        findMany: vi.fn().mockResolvedValue([
          {
            inscripcion: {
              estudiantePerfil: {
                id: 21,
                usuario: { id: 101, nombre: 'Ana', apellido: 'Lopez' },
              },
            },
          },
          {
            inscripcion: {
              estudiantePerfil: {
                id: 22,
                usuario: { id: 102, nombre: 'Luis', apellido: 'Perez' },
              },
            },
          },
        ]),
      },
    } as unknown as PrismaService;
    const service = new TareasService(prisma, {} as PagosService);

    const resultado = await service.obtenerEntregasPorTarea(7, 42, 'PROFESOR', 3);

    expect(tareaFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 7, grupoId: 3 } }),
    );
    expect(resultado.estudiantes).toEqual([
      expect.objectContaining({
        estudiantePerfilId: 21,
        estado: 'PENDIENTE_DE_REVISION',
      }),
      expect.objectContaining({
        estudiantePerfilId: 22,
        estado: 'NO_ENTREGADA',
        entrega: null,
      }),
    ]);
    expect(resultado.resumen.noEntregadas).toBe(1);
  });
});
