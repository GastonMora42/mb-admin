-- AlterTable
ALTER TABLE "Concepto" ALTER COLUMN "montoRegular" DROP DEFAULT,
ALTER COLUMN "montoSuelto" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Deuda" ALTER COLUMN "tipoDeuda" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Liquidacion" ALTER COLUMN "montoTotalRegular" DROP DEFAULT,
ALTER COLUMN "montoTotalSueltas" DROP DEFAULT,
ALTER COLUMN "totalLiquidar" DROP DEFAULT;
