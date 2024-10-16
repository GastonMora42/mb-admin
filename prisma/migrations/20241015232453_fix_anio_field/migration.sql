/*
  Warnings:

  - You are about to drop the column `ano` on the `Deuda` table. All the data in the column will be lost.
  - Added the required column `anio` to the `Deuda` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Deuda" DROP COLUMN "ano",
ADD COLUMN     "anio" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Estilo" ALTER COLUMN "monto" SET DEFAULT 0;
