/*
  Warnings:

  - You are about to drop the `_EstiloToProfesor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_EstiloToProfesor" DROP CONSTRAINT "_EstiloToProfesor_A_fkey";

-- DropForeignKey
ALTER TABLE "_EstiloToProfesor" DROP CONSTRAINT "_EstiloToProfesor_B_fkey";

-- AlterTable
ALTER TABLE "Estilo" ADD COLUMN     "profesorId" INTEGER;

-- DropTable
DROP TABLE "_EstiloToProfesor";

-- AddForeignKey
ALTER TABLE "Estilo" ADD CONSTRAINT "Estilo_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
