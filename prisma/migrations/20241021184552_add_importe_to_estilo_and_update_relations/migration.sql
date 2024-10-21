/*
  Warnings:

  - The primary key for the `AlumnoEstilos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[alumnoId,estiloId]` on the table `AlumnoEstilos` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AlumnoEstilos" DROP CONSTRAINT "AlumnoEstilos_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "AlumnoEstilos_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Estilo" ADD COLUMN     "importe" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "AlumnoEstilos_alumnoId_estiloId_key" ON "AlumnoEstilos"("alumnoId", "estiloId");
