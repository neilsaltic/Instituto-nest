-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('PENDIENTE', 'ACTIVO', 'SUSPENDIDO_MORA', 'INACTIVO');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMINISTRADOR', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES');

-- CreateEnum
CREATE TYPE "ConceptoPago" AS ENUM ('MATRICULA', 'INSCRIPCION', 'MENSUALIDAD');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'PASARELA_ONLINE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "ci" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "telefono" TEXT,
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'PENDIENTE',
    "rol" "Rol" NOT NULL DEFAULT 'ESTUDIANTE',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfiles_estudiantes" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "codigo_matricula" TEXT NOT NULL,
    "nombre_tutor" TEXT NOT NULL,
    "telefono_tutor" TEXT NOT NULL,

    CONSTRAINT "perfiles_estudiantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfiles_profesores" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "especialidad" TEXT NOT NULL,
    "fecha_contratacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfiles_profesores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodos_academicos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "limite_creditos" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "periodos_academicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materias" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creditos" INTEGER NOT NULL,
    "costo_inscripcion" DECIMAL(10,2) NOT NULL,
    "costo_mensualidad" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "materias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" SERIAL NOT NULL,
    "materia_id" INTEGER NOT NULL,
    "periodo_id" INTEGER NOT NULL,
    "profesor_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "cupo_maximo" INTEGER NOT NULL,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_grupos" (
    "id" SERIAL NOT NULL,
    "grupo_id" INTEGER NOT NULL,
    "dia_semana" "DiaSemana" NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,

    CONSTRAINT "horarios_grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones" (
    "id" SERIAL NOT NULL,
    "estudiante_perfil_id" INTEGER NOT NULL,
    "periodo_id" INTEGER NOT NULL,
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_inscripciones" (
    "id" SERIAL NOT NULL,
    "inscripcion_id" INTEGER NOT NULL,
    "grupo_id" INTEGER NOT NULL,

    CONSTRAINT "detalles_inscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tareas" (
    "id" SERIAL NOT NULL,
    "grupo_id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_limite" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tareas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas_tareas" (
    "id" SERIAL NOT NULL,
    "tarea_id" INTEGER NOT NULL,
    "estudiante_perfil_id" INTEGER NOT NULL,
    "contenido_texto" TEXT,
    "archivo_url" TEXT,
    "calificacion" DOUBLE PRECISION,
    "fecha_entrega" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entregas_tareas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "estudiante_usuario_id" INTEGER NOT NULL,
    "concepto" "ConceptoPago" NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo" "MetodoPago" NOT NULL,
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "verificado_por_usuario_id" INTEGER,
    "fecha_verificacion" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "tabla_afectada" TEXT NOT NULL,
    "registro_id" TEXT NOT NULL,
    "detalles" TEXT,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_ci_key" ON "usuarios"("ci");

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_estudiantes_usuario_id_key" ON "perfiles_estudiantes"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_estudiantes_codigo_matricula_key" ON "perfiles_estudiantes"("codigo_matricula");

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_profesores_usuario_id_key" ON "perfiles_profesores"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "materias_codigo_key" ON "materias"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_estudiante_perfil_id_periodo_id_key" ON "inscripciones"("estudiante_perfil_id", "periodo_id");

-- CreateIndex
CREATE UNIQUE INDEX "detalles_inscripciones_inscripcion_id_grupo_id_key" ON "detalles_inscripciones"("inscripcion_id", "grupo_id");

-- CreateIndex
CREATE UNIQUE INDEX "entregas_tareas_tarea_id_estudiante_perfil_id_key" ON "entregas_tareas"("tarea_id", "estudiante_perfil_id");

-- AddForeignKey
ALTER TABLE "perfiles_estudiantes" ADD CONSTRAINT "perfiles_estudiantes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfiles_profesores" ADD CONSTRAINT "perfiles_profesores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_academicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "perfiles_profesores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_grupos" ADD CONSTRAINT "horarios_grupos_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_estudiante_perfil_id_fkey" FOREIGN KEY ("estudiante_perfil_id") REFERENCES "perfiles_estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_academicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_inscripciones" ADD CONSTRAINT "detalles_inscripciones_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "inscripciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_inscripciones" ADD CONSTRAINT "detalles_inscripciones_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas_tareas" ADD CONSTRAINT "entregas_tareas_tarea_id_fkey" FOREIGN KEY ("tarea_id") REFERENCES "tareas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas_tareas" ADD CONSTRAINT "entregas_tareas_estudiante_perfil_id_fkey" FOREIGN KEY ("estudiante_perfil_id") REFERENCES "perfiles_estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_estudiante_usuario_id_fkey" FOREIGN KEY ("estudiante_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_verificado_por_usuario_id_fkey" FOREIGN KEY ("verificado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
