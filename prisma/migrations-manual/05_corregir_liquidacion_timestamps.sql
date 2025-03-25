-- Asegurar que los campos de timestamp tienen valores por defecto
ALTER TABLE "Liquidacion" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Liquidacion" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- Si hay liquidaciones con valores nulos, actualizarlas
UPDATE "Liquidacion" 
SET 
  "createdAt" = CURRENT_TIMESTAMP,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "createdAt" IS NULL OR "updatedAt" IS NULL;