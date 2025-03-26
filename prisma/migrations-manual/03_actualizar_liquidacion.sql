-- Añadir nuevos campos a Liquidacion
ALTER TABLE "Liquidacion" ADD COLUMN IF NOT EXISTS "montoTotalRegular" FLOAT DEFAULT 0;
ALTER TABLE "Liquidacion" ADD COLUMN IF NOT EXISTS "montoTotalSueltas" FLOAT DEFAULT 0;
ALTER TABLE "Liquidacion" ADD COLUMN IF NOT EXISTS "totalLiquidar" FLOAT DEFAULT 0;
ALTER TABLE "Liquidacion" ADD COLUMN IF NOT EXISTS "porcentajeRegular" FLOAT DEFAULT 0.6;
ALTER TABLE "Liquidacion" ADD COLUMN IF NOT EXISTS "porcentajeSueltas" FLOAT DEFAULT 0.8;

-- Actualizar valores existentes
UPDATE "Liquidacion" 
SET 
  "montoTotalRegular" = "montoCursos",
  "montoTotalSueltas" = "montoClasesSueltas",
  "totalLiquidar" = "montoTotal",
  "porcentajeRegular" = "porcentajeCursos",
  "porcentajeSueltas" = "porcentajeClasesSueltas"
WHERE "montoTotalRegular" IS NULL OR "montoTotalRegular" = 0;