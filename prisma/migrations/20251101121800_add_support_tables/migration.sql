-- CreateEnum
CREATE TYPE "CategoriaTicket" AS ENUM ('acceso_plataforma', 'funcionalidad_academica', 'comunicaciones', 'reportes', 'sugerencias', 'errores_sistema', 'otros');

-- CreateEnum
CREATE TYPE "EstadoTicket" AS ENUM ('pendiente', 'en_progreso', 'esperando_respuesta', 'resuelto', 'cerrado', 'cancelado');

-- CreateEnum
CREATE TYPE "PrioridadTicket" AS ENUM ('baja', 'normal', 'alta', 'critica');

-- CreateTable
CREATE TABLE "tickets_soporte" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "numero_ticket" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" "CategoriaTicket" NOT NULL,
    "prioridad" "PrioridadTicket" NOT NULL DEFAULT 'normal',
    "estado" "EstadoTicket" NOT NULL DEFAULT 'pendiente',
    "usuario_id" UUID NOT NULL,
    "asignado_a" UUID,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_asignacion" TIMESTAMP(3),
    "fecha_resolucion" TIMESTAMP(3),
    "tiempo_respuesta_horas" INTEGER,
    "satisfaccion_usuario" INTEGER,
    "año_academico" INTEGER NOT NULL,

    CONSTRAINT "tickets_soporte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_soporte_numero_ticket_key" ON "tickets_soporte"("numero_ticket");

-- CreateTable
CREATE TABLE "respuestas_tickets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticket_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "contenido" TEXT NOT NULL,
    "es_respuesta_publica" BOOLEAN NOT NULL DEFAULT true,
    "fecha_respuesta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_cambio" TEXT,

    CONSTRAINT "respuestas_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_faq" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "categorias_faq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_faq_nombre_key" ON "categorias_faq"("nombre");

-- CreateTable
CREATE TABLE "faq" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pregunta" TEXT NOT NULL,
    "respuesta" TEXT NOT NULL,
    "categoria_id" UUID NOT NULL,
    "orden" INTEGER NOT NULL,
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_guias" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "categorias_guias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_guias_nombre_key" ON "categorias_guias"("nombre");

-- CreateTable
CREATE TABLE "guias" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria_id" UUID NOT NULL,
    "icono" TEXT NOT NULL,
    "pdf_url" TEXT NOT NULL,
    "paginas" INTEGER,
    "tamaño_mb" DECIMAL(8,2),
    "descargas" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guias_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tickets_soporte" ADD CONSTRAINT "tickets_soporte_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_soporte" ADD CONSTRAINT "tickets_soporte_asignado_a_fkey" FOREIGN KEY ("asignado_a") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_tickets" ADD CONSTRAINT "respuestas_tickets_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets_soporte"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_tickets" ADD CONSTRAINT "respuestas_tickets_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq" ADD CONSTRAINT "faq_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_faq"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias" ADD CONSTRAINT "guias_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_guias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- UpdateTable
ALTER TABLE "archivos_adjuntos" ADD COLUMN "ticket_id" UUID;

-- AddForeignKey
ALTER TABLE "archivos_adjuntos" ADD CONSTRAINT "archivos_adjuntos_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets_soporte"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- UpdateTable
ALTER TABLE "notificaciones" ADD COLUMN "ticket_id" UUID;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets_soporte"("id") ON DELETE SET NULL ON UPDATE CASCADE;