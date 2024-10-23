-- DropForeignKey
ALTER TABLE "Liquidacion" DROP CONSTRAINT "Liquidacion_profesorId_fkey";

-- AlterTable
ALTER TABLE "Liquidacion" ALTER COLUMN "profesorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Liquidacion" ADD CONSTRAINT "Liquidacion_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
