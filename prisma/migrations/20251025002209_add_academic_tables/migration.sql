-- CreateTable
CREATE TABLE "public"."evaluaciones" (
    "id" UUID NOT NULL,
    "estudiante_id" UUID NOT NULL,
    "curso_id" UUID NOT NULL,
    "estructura_evaluacion_id" UUID NOT NULL,
    "trimestre" INTEGER NOT NULL,
    "año_academico" INTEGER NOT NULL,
    "fecha_evaluacion" TIMESTAMP(3) NOT NULL,
    "calificacion_numerica" DECIMAL(5,2) NOT NULL,
    "calificacion_letra" TEXT NOT NULL,
    "observaciones" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'preliminar',
    "registrado_por" UUID NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asistencias" (
    "id" UUID NOT NULL,
    "estudiante_id" UUID NOT NULL,
    "curso_id" UUID NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tipo_asistencia" TEXT NOT NULL,
    "observaciones" TEXT,
    "registrado_por" UUID NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."calendario_academico" (
    "id" UUID NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tipo_evento" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "nivel_grado_id" UUID,
    "año_academico" INTEGER NOT NULL,
    "estado_activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "calendario_academico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evaluaciones_estudiante_id_año_academico_trimestre_curso_i_idx" ON "public"."evaluaciones"("estudiante_id", "año_academico", "trimestre", "curso_id", "estructura_evaluacion_id");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_estudiante_id_curso_id_fecha_key" ON "public"."asistencias"("estudiante_id", "curso_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "calendario_academico_fecha_nivel_grado_id_key" ON "public"."calendario_academico"("fecha", "nivel_grado_id");

-- AddForeignKey
ALTER TABLE "public"."evaluaciones" ADD CONSTRAINT "evaluaciones_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "public"."estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evaluaciones" ADD CONSTRAINT "evaluaciones_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "public"."cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evaluaciones" ADD CONSTRAINT "evaluaciones_estructura_evaluacion_id_fkey" FOREIGN KEY ("estructura_evaluacion_id") REFERENCES "public"."estructura_evaluacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evaluaciones" ADD CONSTRAINT "evaluaciones_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asistencias" ADD CONSTRAINT "asistencias_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "public"."estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asistencias" ADD CONSTRAINT "asistencias_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "public"."cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asistencias" ADD CONSTRAINT "asistencias_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."calendario_academico" ADD CONSTRAINT "calendario_academico_nivel_grado_id_fkey" FOREIGN KEY ("nivel_grado_id") REFERENCES "public"."nivel_grado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
