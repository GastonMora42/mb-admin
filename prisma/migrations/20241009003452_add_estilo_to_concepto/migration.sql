-- AlterTable
ALTER TABLE "Concepto" ADD COLUMN "estiloId" INTEGER;

-- AddForeignKey
ALTER TABLE "Concepto" ADD CONSTRAINT "Concepto_estiloId_fkey" FOREIGN KEY ("estiloId") REFERENCES "Estilo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- UpdateData
UPDATE "Concepto" SET "estiloId" = (SELECT id FROM "Estilo" LIMIT 1);

-- SetNotNull
ALTER TABLE "Concepto" ALTER COLUMN "estiloId" SET NOT NULL;