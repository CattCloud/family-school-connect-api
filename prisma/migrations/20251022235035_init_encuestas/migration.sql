-- CreateEnum
CREATE TYPE "public"."Rol" AS ENUM ('apoderado', 'docente', 'director', 'administrador');

-- CreateEnum
CREATE TYPE "public"."EstadoEncuesta" AS ENUM ('borrador', 'activa', 'cerrada', 'vencida');

-- CreateEnum
CREATE TYPE "public"."TipoPregunta" AS ENUM ('texto_corto', 'texto_largo', 'opcion_unica', 'opcion_multiple', 'escala_1_5');

-- CreateEnum
CREATE TYPE "public"."PermisoTipo" AS ENUM ('comunicados', 'encuestas');

-- CreateEnum
CREATE TYPE "public"."EvalTipo" AS ENUM ('unica', 'recurrente');

-- CreateEnum
CREATE TYPE "public"."MatriculaEstado" AS ENUM ('activo', 'retirado', 'trasladado');

-- CreateEnum
CREATE TYPE "public"."RelacionTipo" AS ENUM ('padre', 'madre', 'apoderado', 'tutor');

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" UUID NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "nro_documento" VARCHAR(20) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "public"."Rol" NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_ultimo_login" TIMESTAMP(3),
    "estado_activo" BOOLEAN NOT NULL DEFAULT true,
    "debe_cambiar_password" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_reset_tokens" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "id_usuario" UUID NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tokens_blacklist" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "usuario_id" UUID,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permisos_docentes" (
    "id" UUID NOT NULL,
    "docente_id" UUID NOT NULL,
    "tipo_permiso" "public"."PermisoTipo" NOT NULL,
    "estado_activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_otorgamiento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "otorgado_por" UUID,
    "año_academico" INTEGER NOT NULL,

    CONSTRAINT "permisos_docentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permisos_docentes_log" (
    "id" UUID NOT NULL,
    "docente_id" UUID NOT NULL,
    "tipo_permiso" "public"."PermisoTipo" NOT NULL,
    "accion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "otorgado_por" UUID,
    "año_academico" INTEGER NOT NULL,

    CONSTRAINT "permisos_docentes_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nivel_grado" (
    "id" UUID NOT NULL,
    "nivel" TEXT NOT NULL,
    "grado" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "nivel_grado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cursos" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo_curso" TEXT NOT NULL,
    "nivel_grado_id" UUID NOT NULL,
    "año_academico" INTEGER NOT NULL,
    "estado_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asignaciones_docente_curso" (
    "id" UUID NOT NULL,
    "docente_id" UUID NOT NULL,
    "curso_id" UUID NOT NULL,
    "nivel_grado_id" UUID NOT NULL,
    "año_academico" INTEGER NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL,
    "estado_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "asignaciones_docente_curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."estructura_evaluacion" (
    "id" UUID NOT NULL,
    "año_academico" INTEGER NOT NULL,
    "nombre_item" TEXT NOT NULL,
    "peso_porcentual" DECIMAL(5,2) NOT NULL,
    "tipo_evaluacion" "public"."EvalTipo" NOT NULL,
    "orden_visualizacion" INTEGER NOT NULL,
    "estado_activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_configuracion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bloqueada" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "estructura_evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."estudiantes" (
    "id" UUID NOT NULL,
    "codigo_estudiante" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "nivel_grado_id" UUID NOT NULL,
    "año_academico" INTEGER NOT NULL,
    "estado_matricula" "public"."MatriculaEstado" NOT NULL DEFAULT 'activo',

    CONSTRAINT "estudiantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."relaciones_familiares" (
    "id" UUID NOT NULL,
    "apoderado_id" UUID NOT NULL,
    "estudiante_id" UUID NOT NULL,
    "tipo_relacion" "public"."RelacionTipo" NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_activo" BOOLEAN NOT NULL DEFAULT true,
    "año_academico" INTEGER NOT NULL,

    CONSTRAINT "relaciones_familiares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."encuestas" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_vencimiento" TIMESTAMP(3),
    "fecha_cierre" TIMESTAMP(3),
    "estado" "public"."EstadoEncuesta" NOT NULL DEFAULT 'borrador',
    "permite_respuesta_multiple" BOOLEAN NOT NULL DEFAULT false,
    "es_anonima" BOOLEAN NOT NULL DEFAULT false,
    "mostrar_resultados" BOOLEAN NOT NULL DEFAULT true,
    "autor_id" UUID NOT NULL,
    "año_academico" INTEGER NOT NULL,

    CONSTRAINT "encuestas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."preguntas_encuesta" (
    "id" UUID NOT NULL,
    "encuesta_id" UUID NOT NULL,
    "texto" TEXT NOT NULL,
    "tipo" "public"."TipoPregunta" NOT NULL,
    "obligatoria" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "preguntas_encuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."opciones_pregunta" (
    "id" UUID NOT NULL,
    "pregunta_id" UUID NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "opciones_pregunta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."respuestas_encuestas" (
    "id" UUID NOT NULL,
    "encuesta_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "estudiante_id" UUID,
    "fecha_respuesta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tiempo_respuesta_minutos" INTEGER,
    "ip_respuesta" TEXT,

    CONSTRAINT "respuestas_encuestas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."respuestas_pregunta" (
    "id" UUID NOT NULL,
    "respuesta_id" UUID NOT NULL,
    "pregunta_id" UUID NOT NULL,
    "valor_texto" TEXT,
    "valor_opcion_id" TEXT,
    "valor_opciones" TEXT[],
    "valor_escala" INTEGER,

    CONSTRAINT "respuestas_pregunta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."votos_encuesta" (
    "id" UUID NOT NULL,
    "respuesta_id" UUID NOT NULL,
    "pregunta_id" UUID NOT NULL,
    "opcion_id" UUID NOT NULL,
    "respuesta_pregunta_id" UUID,

    CONSTRAINT "votos_encuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notificaciones" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "contenido" TEXT NOT NULL,
    "datos_adicionales" JSONB,
    "canal" TEXT NOT NULL,
    "estado_plataforma" TEXT NOT NULL DEFAULT 'pendiente',
    "estado_whatsapp" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega_plataforma" TIMESTAMP(3),
    "fecha_envio_whatsapp" TIMESTAMP(3),
    "fecha_lectura" TIMESTAMP(3),
    "url_destino" TEXT,
    "estudiante_id" UUID,
    "referencia_id" TEXT,
    "tipo_referencia" TEXT,
    "año_academico" INTEGER NOT NULL,
    "encuesta_id" UUID,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_tipo_documento_nro_documento_key" ON "public"."usuarios"("tipo_documento", "nro_documento");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "public"."password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "idx_reset_tokens_usuario_fecha" ON "public"."password_reset_tokens"("id_usuario", "fecha_creacion");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_blacklist_token_key" ON "public"."tokens_blacklist"("token");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_docentes_docente_id_tipo_permiso_año_academico_key" ON "public"."permisos_docentes"("docente_id", "tipo_permiso", "año_academico");

-- CreateIndex
CREATE INDEX "permisos_docentes_log_docente_id_año_academico_idx" ON "public"."permisos_docentes_log"("docente_id", "año_academico");

-- CreateIndex
CREATE UNIQUE INDEX "nivel_grado_nivel_grado_key" ON "public"."nivel_grado"("nivel", "grado");

-- CreateIndex
CREATE UNIQUE INDEX "cursos_codigo_curso_key" ON "public"."cursos"("codigo_curso");

-- CreateIndex
CREATE INDEX "asignaciones_docente_curso_docente_id_año_academico_estado_idx" ON "public"."asignaciones_docente_curso"("docente_id", "año_academico", "estado_activo");

-- CreateIndex
CREATE INDEX "estructura_evaluacion_año_academico_estado_activo_idx" ON "public"."estructura_evaluacion"("año_academico", "estado_activo");

-- CreateIndex
CREATE UNIQUE INDEX "estudiantes_codigo_estudiante_key" ON "public"."estudiantes"("codigo_estudiante");

-- CreateIndex
CREATE INDEX "estudiantes_nivel_grado_id_año_academico_idx" ON "public"."estudiantes"("nivel_grado_id", "año_academico");

-- CreateIndex
CREATE INDEX "idx_relaciones_apoderado" ON "public"."relaciones_familiares"("apoderado_id", "estado_activo");

-- CreateIndex
CREATE INDEX "idx_relaciones_estudiante" ON "public"."relaciones_familiares"("estudiante_id");

-- CreateIndex
CREATE UNIQUE INDEX "respuestas_encuestas_encuesta_id_usuario_id_key" ON "public"."respuestas_encuestas"("encuesta_id", "usuario_id");

-- AddForeignKey
ALTER TABLE "public"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tokens_blacklist" ADD CONSTRAINT "tokens_blacklist_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."permisos_docentes" ADD CONSTRAINT "permisos_docentes_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."permisos_docentes" ADD CONSTRAINT "permisos_docentes_otorgado_por_fkey" FOREIGN KEY ("otorgado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."permisos_docentes_log" ADD CONSTRAINT "permisos_docentes_log_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."permisos_docentes_log" ADD CONSTRAINT "permisos_docentes_log_otorgado_por_fkey" FOREIGN KEY ("otorgado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cursos" ADD CONSTRAINT "cursos_nivel_grado_id_fkey" FOREIGN KEY ("nivel_grado_id") REFERENCES "public"."nivel_grado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asignaciones_docente_curso" ADD CONSTRAINT "asignaciones_docente_curso_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asignaciones_docente_curso" ADD CONSTRAINT "asignaciones_docente_curso_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "public"."cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asignaciones_docente_curso" ADD CONSTRAINT "asignaciones_docente_curso_nivel_grado_id_fkey" FOREIGN KEY ("nivel_grado_id") REFERENCES "public"."nivel_grado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estudiantes" ADD CONSTRAINT "estudiantes_nivel_grado_id_fkey" FOREIGN KEY ("nivel_grado_id") REFERENCES "public"."nivel_grado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."relaciones_familiares" ADD CONSTRAINT "relaciones_familiares_apoderado_id_fkey" FOREIGN KEY ("apoderado_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."relaciones_familiares" ADD CONSTRAINT "relaciones_familiares_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "public"."estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."encuestas" ADD CONSTRAINT "encuestas_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."preguntas_encuesta" ADD CONSTRAINT "preguntas_encuesta_encuesta_id_fkey" FOREIGN KEY ("encuesta_id") REFERENCES "public"."encuestas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."opciones_pregunta" ADD CONSTRAINT "opciones_pregunta_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "public"."preguntas_encuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respuestas_encuestas" ADD CONSTRAINT "respuestas_encuestas_encuesta_id_fkey" FOREIGN KEY ("encuesta_id") REFERENCES "public"."encuestas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respuestas_encuestas" ADD CONSTRAINT "respuestas_encuestas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respuestas_encuestas" ADD CONSTRAINT "respuestas_encuestas_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "public"."estudiantes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respuestas_pregunta" ADD CONSTRAINT "respuestas_pregunta_respuesta_id_fkey" FOREIGN KEY ("respuesta_id") REFERENCES "public"."respuestas_encuestas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respuestas_pregunta" ADD CONSTRAINT "respuestas_pregunta_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "public"."preguntas_encuesta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."votos_encuesta" ADD CONSTRAINT "votos_encuesta_respuesta_id_fkey" FOREIGN KEY ("respuesta_id") REFERENCES "public"."respuestas_encuestas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."votos_encuesta" ADD CONSTRAINT "votos_encuesta_pregunta_id_fkey" FOREIGN KEY ("pregunta_id") REFERENCES "public"."preguntas_encuesta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."votos_encuesta" ADD CONSTRAINT "votos_encuesta_opcion_id_fkey" FOREIGN KEY ("opcion_id") REFERENCES "public"."opciones_pregunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."votos_encuesta" ADD CONSTRAINT "votos_encuesta_respuesta_pregunta_id_fkey" FOREIGN KEY ("respuesta_pregunta_id") REFERENCES "public"."respuestas_pregunta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notificaciones" ADD CONSTRAINT "notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notificaciones" ADD CONSTRAINT "notificaciones_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "public"."estudiantes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notificaciones" ADD CONSTRAINT "notificaciones_encuesta_id_fkey" FOREIGN KEY ("encuesta_id") REFERENCES "public"."encuestas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
