-- DropForeignKey
ALTER TABLE "Deuda" DROP CONSTRAINT "Deuda_estiloId_fkey";

-- AlterTable
ALTER TABLE "Deuda" ALTER COLUMN "estiloId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Deuda" ADD CONSTRAINT "Deuda_estiloId_fkey" FOREIGN KEY ("estiloId") REFERENCES "Estilo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
