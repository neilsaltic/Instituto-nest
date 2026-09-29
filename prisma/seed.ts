import {
  PrismaClient,
  EstadoUsuario,
  Rol,
  DiaSemana,
  ConceptoPago,
  MetodoPago,
  EstadoPago,
} from '../src/generated/prisma/client.js';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Limpiando la base de datos...');

  // Limpieza en orden inverso de relaciones para evitar errores de claves foráneas
  await prisma.auditoria.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.entregaTarea.deleteMany();
  await prisma.tarea.deleteMany();
  await prisma.detalleInscripcion.deleteMany();
  await prisma.inscripcion.deleteMany();
  await prisma.horarioGrupo.deleteMany();
  await prisma.grupo.deleteMany();
  await prisma.materia.deleteMany();
  await prisma.periodoAcademico.deleteMany();
  await prisma.perfilProfesor.deleteMany();
  await prisma.perfilEstudiante.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('🔑 Hasheando contraseñas...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // ---------------------------------------------------------------------------
  // 1. CREACIÓN DE USUARIOS Y PERFILES
  // ---------------------------------------------------------------------------
  console.log('👤 Creando usuarios y perfiles...');

  // Administrador
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@sgaf.edu',
      password: passwordHash,
      nombre: 'Carlos',
      apellido: 'Administrador',
      ci: '1234567',
      fechaNacimiento: new Date('1985-05-15'),
      telefono: '70000001',
      estado: EstadoUsuario.ACTIVO,
      rol: Rol.ADMINISTRADOR,
    },
  });

  // Recepcionista
  const recepcionista = await prisma.usuario.create({
    data: {
      email: 'recepcion@sgaf.edu',
      password: passwordHash,
      nombre: 'Maria',
      apellido: 'Recepcion',
      ci: '2345678',
      fechaNacimiento: new Date('1992-08-20'),
      telefono: '70000002',
      estado: EstadoUsuario.ACTIVO,
      rol: Rol.RECEPCIONISTA,
    },
  });

  // Profesores
  const usuarioProfesor1 = await prisma.usuario.create({
    data: {
      email: 'profesor1@sgaf.edu',
      password: passwordHash,
      nombre: 'Roberto',
      apellido: 'Gomez',
      ci: '3456789',
      fechaNacimiento: new Date('1980-03-10'),
      telefono: '70000003',
      estado: EstadoUsuario.ACTIVO,
      rol: Rol.PROFESOR,
      perfilProfesor: {
        create: {
          especialidad: 'Desarrollo de Software',
          fechaContratacion: new Date('2021-02-01'),
        },
      },
    },
    include: { perfilProfesor: true },
  });

  const usuarioProfesor2 = await prisma.usuario.create({
    data: {
      email: 'profesor2@sgaf.edu',
      password: passwordHash,
      nombre: 'Ana',
      apellido: 'Martínez',
      ci: '4567890',
      fechaNacimiento: new Date('1988-11-25'),
      telefono: '70000004',
      estado: EstadoUsuario.ACTIVO,
      rol: Rol.PROFESOR,
      perfilProfesor: {
        create: {
          especialidad: 'Bases de Datos',
          fechaContratacion: new Date('2022-01-15'),
        },
      },
    },
    include: { perfilProfesor: true },
  });

  // Estudiantes Activos
  const estudiante1 = await prisma.usuario.create({
    data: {
      email: 'estudiante1@sgaf.edu',
      password: passwordHash,
      nombre: 'Juan',
      apellido: 'Perez',
      ci: '5678901',
      fechaNacimiento: new Date('2002-04-12'),
      telefono: '70000005',
      estado: EstadoUsuario.ACTIVO,
      rol: Rol.ESTUDIANTE,
      perfilEstudiante: {
        create: {
          codigoMatricula: 'EST-2026-001',
          nombreTutor: 'Pedro Perez',
          telefonoTutor: '71111111',
        },
      },
    },
    include: { perfilEstudiante: true },
  });

  const estudiante2 = await prisma.usuario.create({
    data: {
      email: 'estudiante2@sgaf.edu',
      password: passwordHash,
      nombre: 'Lucia',
      apellido: 'Fernandez',
      ci: '6789012',
      fechaNacimiento: new Date('2003-09-18'),
      telefono: '70000006',
      estado: EstadoUsuario.ACTIVO,
      rol: Rol.ESTUDIANTE,
      perfilEstudiante: {
        create: {
          codigoMatricula: 'EST-2026-002',
          nombreTutor: 'Laura Fernandez',
          telefonoTutor: '72222222',
        },
      },
    },
    include: { perfilEstudiante: true },
  });

  // Postulante Pendiente (Para probar la aprobación en la evaluación)
  const postulante = await prisma.usuario.create({
    data: {
      email: 'postulante@sgaf.edu',
      password: passwordHash,
      nombre: 'Marcos',
      apellido: 'Siles',
      ci: '7890123',
      fechaNacimiento: new Date('2004-01-05'),
      telefono: '70000007',
      estado: EstadoUsuario.PENDIENTE,
      rol: Rol.ESTUDIANTE,
      perfilEstudiante: {
        create: {
          codigoMatricula: 'EST-2026-003',
          nombreTutor: 'Carmen Siles',
          telefonoTutor: '73333333',
        },
      },
    },
    include: { perfilEstudiante: true },
  });

  // ---------------------------------------------------------------------------
  // 2. ESTRUCTURA ACADÉMICA
  // ---------------------------------------------------------------------------
  console.log('📚 Creando periodo lectivo y materias...');

  const periodo = await prisma.periodoAcademico.create({
    data: {
      nombre: '2026-I',
      fechaInicio: new Date('2026-02-01'),
      fechaFin: new Date('2026-06-30'),
      limiteCreditos: 15,
      activo: true,
    },
  });

  const materia1 = await prisma.materia.create({
    data: {
      codigo: 'PROG-101',
      nombre: 'Programación Backend NestJS',
      creditos: 5,
      costoInscripcion: 100.0,
      costoMensualidad: 250.0,
    },
  });

  const materia2 = await prisma.materia.create({
    data: {
      codigo: 'BD-201',
      nombre: 'Bases de Datos con Prisma y Postgres',
      creditos: 4,
      costoInscripcion: 100.0,
      costoMensualidad: 220.0,
    },
  });

  // ---------------------------------------------------------------------------
  // 3. GRUPOS Y HORARIOS
  // ---------------------------------------------------------------------------
  console.log('🏫 Creando grupos y sus horarios...');

  const grupo1 = await prisma.grupo.create({
    data: {
      nombre: 'Grupo A',
      materiaId: materia1.id,
      periodoId: periodo.id,
      profesorId: usuarioProfesor1.perfilProfesor!.id,
      cupoMaximo: 2, // Cupo reducido a 2 para poder testear la regla de cupo lleno
      horarios: {
        create: [
          {
            diaSemana: DiaSemana.LUNES,
            horaInicio: '08:00',
            horaFin: '10:00',
          },
          {
            diaSemana: DiaSemana.MIERCOLES,
            horaInicio: '08:00',
            horaFin: '10:00',
          },
        ],
      },
    },
  });

  const grupo2 = await prisma.grupo.create({
    data: {
      nombre: 'Grupo B',
      materiaId: materia2.id,
      periodoId: periodo.id,
      profesorId: usuarioProfesor2.perfilProfesor!.id,
      cupoMaximo: 25,
      horarios: {
        create: [
          {
            diaSemana: DiaSemana.MARTES,
            horaInicio: '10:00',
            horaFin: '12:00',
          },
          {
            diaSemana: DiaSemana.JUEVES,
            horaInicio: '10:00',
            horaFin: '12:00',
          },
        ],
      },
    },
  });

  // ---------------------------------------------------------------------------
  // 4. INSCRIPCIONES Y DETALLES
  // ---------------------------------------------------------------------------
  console.log('📝 Registrando inscripciones...');

  const inscripcion1 = await prisma.inscripcion.create({
    data: {
      estudiantePerfilId: estudiante1.perfilEstudiante!.id,
      periodoId: periodo.id,
      detalles: {
        create: [{ grupoId: grupo1.id }, { grupoId: grupo2.id }],
      },
    },
  });

  const inscripcion2 = await prisma.inscripcion.create({
    data: {
      estudiantePerfilId: estudiante2.perfilEstudiante!.id,
      periodoId: periodo.id,
      detalles: {
        create: [
          { grupoId: grupo1.id }, // Ocupa el 2do cupo del Grupo A
        ],
      },
    },
  });

  // ---------------------------------------------------------------------------
  // 5. AULA VIRTUAL (TAREAS Y ENTREGAS)
  // ---------------------------------------------------------------------------
  console.log('💻 Creando tareas y entregas del aula virtual...');

  const tarea1 = await prisma.tarea.create({
    data: {
      grupoId: grupo1.id,
      titulo: 'Proyecto NestJS Modular',
      descripcion: 'Crear los módulos principales del proyecto SGAF.',
      fechaLimite: new Date('2026-10-15T23:59:59Z'),
    },
  });

  await prisma.entregaTarea.create({
    data: {
      tareaId: tarea1.id,
      estudiantePerfilId: estudiante1.perfilEstudiante!.id,
      contenidoTexto: 'https://github.com/usuario/sgaf-backend',
      archivoUrl: 'https://storage.sgaf.edu/entregas/tarea1.zip',
      calificacion: 95.5,
    },
  });

  // ---------------------------------------------------------------------------
  // 6. PAGOS Y AUDITORÍA
  // ---------------------------------------------------------------------------
  console.log('💳 Registrando pagos y auditorías...');

  // Pago de matrícula del estudiante activo
  await prisma.pago.create({
    data: {
      estudianteUsuarioId: estudiante1.id,
      concepto: ConceptoPago.MATRICULA,
      monto: 100.0,
      metodo: MetodoPago.TRANSFERENCIA,
      estado: EstadoPago.APROBADO,
      verificadoPorUsuarioId: recepcionista.id,
      fechaVerificacion: new Date(),
    },
  });

  // Pago del postulante pendiente registrado en línea
  await prisma.pago.create({
    data: {
      estudianteUsuarioId: postulante.id,
      concepto: ConceptoPago.MATRICULA,
      monto: 100.0,
      metodo: MetodoPago.PASARELA_ONLINE,
      estado: EstadoPago.PENDIENTE,
    },
  });

  // Auditoría de prueba
  await prisma.auditoria.create({
    data: {
      usuarioId: admin.id,
      accion: 'CREACION_USUARIO',
      tablaAfectada: 'usuarios',
      registroId: estudiante1.id.toString(),
      detalles: JSON.stringify({
        email: estudiante1.email,
        rol: estudiante1.rol,
      }),
    },
  });

  console.log('✅ Base de datos sembrada exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
