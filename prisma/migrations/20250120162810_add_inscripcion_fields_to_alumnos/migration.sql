-- AlterTable
ALTER TABLE "Alumno" ADD COLUMN     "fechaPagoInscripcion" TIMESTAMP(3),
ADD COLUMN     "inscripcionPagada" BOOLEAN NOT NULL DEFAULT false;
