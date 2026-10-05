import {
  PrismaClient,
  Rol,
  EstadoUsuario,
  DiaSemana,
  ConceptoPago,
  MetodoPago,
  EstadoPago,
} from '../src/generated/prisma/client.js';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({} as any);

async function main() {
  console.log(' Iniciando la siembra de datos de prueba (Seed)...');

  // 1. Limpiar la base de datos previa para evitar duplicados de correo o CI
  await prisma.entregaTarea.deleteMany();
  await prisma.tarea.deleteMany();
  await prisma.detalleInscripcion.deleteMany();
  await prisma.inscripcion.deleteMany();
  await prisma.horarioGrupo.deleteMany();
  await prisma.grupo.deleteMany();
  await prisma.materia.deleteMany();
  await prisma.periodoAcademico.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.perfilEstudiante.deleteMany();
  await prisma.perfilProfesor.deleteMany();
  await prisma.auditoria.deleteMany();
  await prisma.usuario.deleteMany();

  const saltRounds = 10;

  // 2. Crear Usuarios (Administrador, Recepcionista, Profesor, Estudiantes)
  const passAdmin = await bcrypt.hash('123456A', saltRounds);
  const passRecepcion = await bcrypt.hash('123456R', saltRounds);
  const passProfesor = await bcrypt.hash('123456P', saltRounds);
  const passEstudiante = await bcrypt.hash('123456E', saltRounds);

  // Administrador
  const admin = await prisma.usuario.create({
    data: {
      email: 'neilsadmin@gmail.com',
      password: passAdmin,
      nombre: 'Neils',
      apellido: 'Admin',
      ci: '1000001',
      fechaNacimiento: new Date('1990-01-01'),
      telefono: '70000001',
      rol: Rol.ADMINISTRADOR,
      estado: EstadoUsuario.ACTIVO,
    },
  });

  // Recepcionista
  const recepcion = await prisma.usuario.create({
    data: {
      email: 'neilsrecepcion@gmail.com',
      password: passRecepcion,
      nombre: 'Neils',
      apellido: 'Recepción',
      ci: '1000002',
      fechaNacimiento: new Date('1992-05-10'),
      telefono: '70000002',
      rol: Rol.RECEPCIONISTA,
      estado: EstadoUsuario.ACTIVO,
    },
  });

  // Profesor
  const profesorUsuario = await prisma.usuario.create({
    data: {
      email: 'neilsprofesor@gmail.com',
      password: passProfesor,
      nombre: 'Neils',
      apellido: 'Profesor',
      ci: '1000003',
      fechaNacimiento: new Date('1985-08-20'),
      telefono: '70000003',
      rol: Rol.PROFESOR,
      estado: EstadoUsuario.ACTIVO,
      perfilProfesor: {
        create: {
          especialidad: 'Ingeniería de Software / Desarrollo Web',
          fechaContratacion: new Date('2023-01-15'),
        },
      },
    },
    include: { perfilProfesor: true },
  });

  // Estudiante 1 (Activo)
  const estudianteUsuario1 = await prisma.usuario.create({
    data: {
      email: 'neilsestudiante@gmail.com',
      password: passEstudiante,
      nombre: 'Neils',
      apellido: 'Estudiante',
      ci: '1000004',
      fechaNacimiento: new Date('2000-03-15'),
      telefono: '70000004',
      rol: Rol.ESTUDIANTE,
      estado: EstadoUsuario.ACTIVO,
      perfilEstudiante: {
        create: {
          codigoMatricula: 'MAT-2026-001',
          nombreTutor: 'Tutor Neils',
          telefonoTutor: '70000099',
        },
      },
    },
    include: { perfilEstudiante: true },
  });

  // Estudiante 2 (Pendiente de pago)
  const estudianteUsuario2 = await prisma.usuario.create({
    data: {
      email: 'neilsestudiante2@gmail.com',
      password: passEstudiante,
      nombre: 'Neils 2',
      apellido: 'Pendiente',
      ci: '1000005',
      fechaNacimiento: new Date('2001-07-11'),
      telefono: '70000005',
      rol: Rol.ESTUDIANTE,
      estado: EstadoUsuario.PENDIENTE,
      perfilEstudiante: {
        create: {
          codigoMatricula: 'MAT-2026-002',
          nombreTutor: 'Tutor Secundario',
          telefonoTutor: '70000098',
        },
      },
    },
  });

  console.log('✅ Usuarios y Perfiles creados correctamente');

  // 3. Crear Periodo Académico
  const periodo = await prisma.periodoAcademico.create({
    data: {
      nombre: '2026-I',
      fechaInicio: new Date('2026-02-01'),
      fechaFin: new Date('2026-06-30'),
      limiteCreditos: 25,
      activo: true,
    },
  });

  console.log('✅ Periodo Académico creado');

  // 4. Crear 5 Materias / Cursos
  const materiasData = [
    {
      codigo: 'MAT-101',
      nombre: 'Programación Web I',
      creditos: 5,
      costoInscripcion: 150.0,
      costoMensualidad: 300.0,
    },
    {
      codigo: 'MAT-102',
      nombre: 'Bases de Datos I',
      creditos: 5,
      costoInscripcion: 150.0,
      costoMensualidad: 300.0,
    },
    {
      codigo: 'MAT-103',
      nombre: 'Arquitectura de Software',
      creditos: 4,
      costoInscripcion: 180.0,
      costoMensualidad: 350.0,
    },
    {
      codigo: 'MAT-104',
      nombre: 'Estructuras de Datos',
      creditos: 4,
      costoInscripcion: 140.0,
      costoMensualidad: 280.0,
    },
    {
      codigo: 'MAT-105',
      nombre: 'Gestión de Proyectos TI',
      creditos: 3,
      costoInscripcion: 120.0,
      costoMensualidad: 250.0,
    },
  ];

  const materias = [];
  for (const m of materiasData) {
    const mat = await prisma.materia.create({ data: m });
    materias.push(mat);
  }

  console.log('✅ 5 Materias creadas');

  // 5. Crear Grupos y Horarios para las 2 primeras materias
  const grupo1 = await prisma.grupo.create({
    data: {
      materiaId: materias[0].id,
      periodoId: periodo.id,
      profesorId: profesorUsuario.perfilProfesor!.id,
      nombre: 'Grupo A',
      cupoMaximo: 30,
      horarios: {
        create: [
          { diaSemana: DiaSemana.LUNES, horaInicio: '08:00', horaFin: '10:00' },
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
      materiaId: materias[1].id,
      periodoId: periodo.id,
      profesorId: profesorUsuario.perfilProfesor!.id,
      nombre: 'Grupo B',
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

  console.log('✅ Grupos y Horarios creados');

  // 6. Crear Inscripción para el estudiante activo
  const inscripcion = await prisma.inscripcion.create({
    data: {
      estudiantePerfilId: estudianteUsuario1.perfilEstudiante!.id,
      periodoId: periodo.id,
      detalles: {
        create: [{ grupoId: grupo1.id }, { grupoId: grupo2.id }],
      },
    },
  });

  console.log('✅ Inscripción de prueba creada');

  // 7. Crear Pagos de prueba
  await prisma.pago.create({
    data: {
      estudianteUsuarioId: estudianteUsuario1.id,
      concepto: ConceptoPago.MATRICULA,
      monto: 150.0,
      metodo: MetodoPago.EFECTIVO,
      estado: EstadoPago.APROBADO,
      verificadoPorUsuarioId: recepcion.id,
      fechaVerificacion: new Date(),
    },
  });

  await prisma.pago.create({
    data: {
      estudianteUsuarioId: estudianteUsuario2.id,
      concepto: ConceptoPago.MATRICULA,
      monto: 150.0,
      metodo: MetodoPago.PASARELA_ONLINE,
      estado: EstadoPago.PENDIENTE,
    },
  });

  console.log('✅ Pagos de prueba creados');
  console.log('🚀 ¡Proceso de Seed finalizado con éxito!');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
