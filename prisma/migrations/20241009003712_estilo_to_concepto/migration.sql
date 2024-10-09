-- DropForeignKey
ALTER TABLE "Concepto" DROP CONSTRAINT "Concepto_estiloId_fkey";

-- AddForeignKey
ALTER TABLE "Concepto" ADD CONSTRAINT "Concepto_estiloId_fkey" FOREIGN KEY ("estiloId") REFERENCES "Estilo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
