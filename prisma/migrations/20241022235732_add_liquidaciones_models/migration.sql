/*
  Warnings:

  - You are about to drop the column `monto` on the `Liquidacion` table. All the data in the column will be lost.
  - Added the required column `anio` to the `Liquidacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mes` to the `Liquidacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `montoClasesSueltas` to the `Liquidacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `montoCursos` to the `Liquidacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `montoTotal` to the `Liquidacion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoLiquidacion" AS ENUM ('PENDIENTE', 'PAGADA', 'ANULADA');

-- AlterTable
ALTER TABLE "Liquidacion" DROP COLUMN "monto",
ADD COLUMN     "anio" INTEGER NOT NULL,
ADD COLUMN     "estado" "EstadoLiquidacion" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "fechaPago" TIMESTAMP(3),
ADD COLUMN     "mes" INTEGER NOT NULL,
ADD COLUMN     "metodoPago" "TipoPago",
ADD COLUMN     "montoClasesSueltas" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "montoCursos" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "montoTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "porcentajeClasesSueltas" DOUBLE PRECISION NOT NULL DEFAULT 0.80,
ADD COLUMN     "porcentajeCursos" DOUBLE PRECISION NOT NULL DEFAULT 0.60;

-- CreateTable
CREATE TABLE "DetalleLiquidacion" (
    "id" SERIAL NOT NULL,
    "liquidacionId" INTEGER NOT NULL,
    "reciboId" INTEGER NOT NULL,
    "montoOriginal" DOUBLE PRECISION NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,
    "montoLiquidado" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DetalleLiquidacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DetalleLiquidacion" ADD CONSTRAINT "DetalleLiquidacion_liquidacionId_fkey" FOREIGN KEY ("liquidacionId") REFERENCES "Liquidacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleLiquidacion" ADD CONSTRAINT "DetalleLiquidacion_reciboId_fkey" FOREIGN KEY ("reciboId") REFERENCES "Recibo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
