-- CreateTable
CREATE TABLE "public"."conversaciones" (
    "id" UUID NOT NULL,
    "estudiante_id" UUID NOT NULL,
    "curso_id" UUID NOT NULL,
    "padre_id" UUID NOT NULL,
    "docente_id" UUID NOT NULL,
    "asunto" VARCHAR(200) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activa',
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_ultimo_mensaje" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "año_academico" INTEGER NOT NULL,
    "tipo_conversacion" TEXT NOT NULL DEFAULT 'padre_docente',
    "creado_por" UUID NOT NULL,

    CONSTRAINT "conversaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mensajes" (
    "id" UUID NOT NULL,
    "conversacion_id" UUID NOT NULL,
    "emisor_id" UUID NOT NULL,
    "contenido" TEXT NOT NULL,
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_lectura" TEXT NOT NULL DEFAULT 'enviado',
    "fecha_lectura" TIMESTAMP(3),
    "tiene_adjuntos" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."archivos_adjuntos" (
    "id" UUID NOT NULL,
    "mensaje_id" UUID NOT NULL,
    "nombre_original" VARCHAR(255) NOT NULL,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "url_cloudinary" TEXT NOT NULL,
    "tipo_mime" VARCHAR(100) NOT NULL,
    "tamaño_bytes" INTEGER NOT NULL,
    "es_imagen" BOOLEAN NOT NULL DEFAULT false,
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subido_por" UUID NOT NULL,

    CONSTRAINT "archivos_adjuntos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."conversaciones" ADD CONSTRAINT "conversaciones_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "public"."estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversaciones" ADD CONSTRAINT "conversaciones_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "public"."cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversaciones" ADD CONSTRAINT "conversaciones_padre_id_fkey" FOREIGN KEY ("padre_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversaciones" ADD CONSTRAINT "conversaciones_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mensajes" ADD CONSTRAINT "mensajes_conversacion_id_fkey" FOREIGN KEY ("conversacion_id") REFERENCES "public"."conversaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mensajes" ADD CONSTRAINT "mensajes_emisor_id_fkey" FOREIGN KEY ("emisor_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."archivos_adjuntos" ADD CONSTRAINT "archivos_adjuntos_mensaje_id_fkey" FOREIGN KEY ("mensaje_id") REFERENCES "public"."mensajes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
