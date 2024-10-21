/*
  Warnings:

  - A unique constraint covering the columns `[dni]` on the table `AlumnoSuelto` will be added. If there are existing duplicate values, this will fail.
  - Made the column `dni` on table `AlumnoSuelto` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AlumnoSuelto" ALTER COLUMN "dni" SET NOT NULL;

-- CreateTable
CREATE TABLE "_AlumnoSueltoToClase" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AlumnoSueltoToClase_AB_unique" ON "_AlumnoSueltoToClase"("A", "B");

-- CreateIndex
CREATE INDEX "_AlumnoSueltoToClase_B_index" ON "_AlumnoSueltoToClase"("B");

-- CreateIndex
CREATE UNIQUE INDEX "AlumnoSuelto_dni_key" ON "AlumnoSuelto"("dni");

-- AddForeignKey
ALTER TABLE "_AlumnoSueltoToClase" ADD CONSTRAINT "_AlumnoSueltoToClase_A_fkey" FOREIGN KEY ("A") REFERENCES "AlumnoSuelto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlumnoSueltoToClase" ADD CONSTRAINT "_AlumnoSueltoToClase_B_fkey" FOREIGN KEY ("B") REFERENCES "Clase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
