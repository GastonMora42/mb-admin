-- AlterTable
ALTER TABLE "Concepto" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "esInscripcion" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Deuda" ADD COLUMN     "conceptoId" INTEGER,
ADD COLUMN     "esInscripcion" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Inscripcion" (
    "id" SERIAL NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "pagada" BOOLEAN NOT NULL DEFAULT false,
    "fechaPago" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_alumnoId_key" ON "Inscripcion"("alumnoId");

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deuda" ADD CONSTRAINT "Deuda_conceptoId_fkey" FOREIGN KEY ("conceptoId") REFERENCES "Concepto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
