-- AlterTable
ALTER TABLE "AlumnoSuelto" ADD COLUMN     "alumnoRegularId" INTEGER;

-- AddForeignKey
ALTER TABLE "AlumnoSuelto" ADD CONSTRAINT "AlumnoSuelto_alumnoRegularId_fkey" FOREIGN KEY ("alumnoRegularId") REFERENCES "Alumno"("id") ON DELETE SET NULL ON UPDATE CASCADE;
