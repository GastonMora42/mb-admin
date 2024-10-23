-- DropForeignKey
ALTER TABLE "DetalleLiquidacion" DROP CONSTRAINT "DetalleLiquidacion_reciboId_fkey";

-- AlterTable
ALTER TABLE "DetalleLiquidacion" ALTER COLUMN "reciboId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DetalleLiquidacion" ADD CONSTRAINT "DetalleLiquidacion_reciboId_fkey" FOREIGN KEY ("reciboId") REFERENCES "Recibo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
