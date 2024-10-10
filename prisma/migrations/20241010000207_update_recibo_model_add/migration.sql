/*
  Warnings:

  - You are about to drop the column `fueraDeTermino` on the `Concepto` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Concepto" DROP CONSTRAINT "Concepto_estiloId_fkey";

-- AlterTable
ALTER TABLE "Concepto" DROP COLUMN "fueraDeTermino",
ALTER COLUMN "estiloId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Concepto" ADD CONSTRAINT "Concepto_estiloId_fkey" FOREIGN KEY ("estiloId") REFERENCES "Estilo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
