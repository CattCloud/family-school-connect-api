-- CreateEnum
CREATE TYPE "TipoComunicado" AS ENUM ('academico', 'administrativo', 'evento', 'urgente', 'informativo');

-- CreateEnum
CREATE TYPE "EstadoComunicado" AS ENUM ('borrador', 'publicado', 'programado', 'archivado', 'cancelado');

-- CreateEnum
CREATE TYPE "PrioridadComunicado" AS ENUM ('baja', 'normal', 'alta');

-- CreateTable
CREATE TABLE "comunicados" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo" "TipoComunicado" NOT NULL,
    "estado" "EstadoComunicado" NOT NULL DEFAULT 'borrador',
    "autor_id" UUID NOT NULL,
    "publico_objetivo" TEXT[],
    "niveles_objetivo" TEXT[],
    "grados_objetivo" TEXT[],
    "cursos_objetivo" TEXT[],
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_publicacion" TIMESTAMP(3),
    "fecha_programada" TIMESTAMP(3),
    "fecha_vigencia_desde" TIMESTAMP(3),
    "fecha_vigencia_hasta" TIMESTAMP(3),
    "requiere_confirmacion" BOOLEAN NOT NULL DEFAULT false,
    "prioridad" "PrioridadComunicado" NOT NULL DEFAULT 'normal',
    "editado" BOOLEAN NOT NULL DEFAULT false,
    "año_academico" INTEGER NOT NULL,

    CONSTRAINT "comunicados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comunicados_lecturas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comunicado_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "fecha_lectura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comunicados_lecturas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comunicados_lecturas_comunicado_id_usuario_id_key" ON "comunicados_lecturas"("comunicado_id", "usuario_id");

-- AddForeignKey
ALTER TABLE "comunicados" ADD CONSTRAINT "comunicados_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicados_lecturas" ADD CONSTRAINT "comunicados_lecturas_comunicado_id_fkey" FOREIGN KEY ("comunicado_id") REFERENCES "comunicados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicados_lecturas" ADD CONSTRAINT "comunicados_lecturas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;