/*
  Warnings:

  - Added the required column `año_academico` to the `asistencias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `asistencias` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."asistencias" ADD COLUMN     "año_academico" INTEGER NOT NULL,
ADD COLUMN     "estado" TEXT NOT NULL,
ADD COLUMN     "hora_llegada" TEXT,
ADD COLUMN     "justificacion" TEXT;
