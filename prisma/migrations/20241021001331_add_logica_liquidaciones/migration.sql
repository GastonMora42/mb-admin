-- AlterTable
ALTER TABLE "Recibo" ADD COLUMN     "claseId" INTEGER,
ADD COLUMN     "esClaseSuelta" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Recibo" ADD CONSTRAINT "Recibo_claseId_fkey" FOREIGN KEY ("claseId") REFERENCES "Clase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
