-- DropForeignKey
ALTER TABLE "Recibo" DROP CONSTRAINT "Recibo_alumnoId_fkey";

-- AlterTable
ALTER TABLE "Recibo" ADD COLUMN     "alumnoSueltoId" INTEGER,
ALTER COLUMN "alumnoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Recibo" ADD CONSTRAINT "Recibo_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recibo" ADD CONSTRAINT "Recibo_alumnoSueltoId_fkey" FOREIGN KEY ("alumnoSueltoId") REFERENCES "AlumnoSuelto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
