/*
  Warnings:

  - A unique constraint covering the columns `[numeroRecibo]` on the table `Recibo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `periodoPago` to the `Recibo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoPago` to the `Recibo` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('EFECTIVO', 'MERCADO_PAGO', 'TRANSFERENCIA', 'DEBITO_AUTOMATICO', 'OTRO');

-- AlterTable
ALTER TABLE "Recibo" ADD COLUMN     "numeroRecibo" SERIAL NOT NULL,
ADD COLUMN     "periodoPago" TEXT NOT NULL,
ADD COLUMN     "tipoPago" "TipoPago" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Recibo_numeroRecibo_key" ON "Recibo"("numeroRecibo");
