-- Asegurarse de que el campo montoClasesSueltas existe y tenga un valor por defecto
ALTER TABLE "Liquidacion" 
  ALTER COLUMN "montoClasesSueltas" SET DEFAULT 0,
  ALTER COLUMN "montoClasesSueltas" DROP NOT NULL;

-- Actualizar todas las liquidaciones existentes que tengan montoClasesSueltas NULL
UPDATE "Liquidacion"
SET "montoClasesSueltas" = 15000
WHERE "montoClasesSueltas" IS NULL;

-- Asegurarse de que otros campos requeridos también tengan valores
UPDATE "Liquidacion"
SET 
  "montoTotal" = COALESCE("montoTotal", 0),
  "montoCursos" = COALESCE("montoCursos", 0),
  "porcentajeCursos" = COALESCE("porcentajeCursos", 0.6),
  "porcentajeClasesSueltas" = COALESCE("porcentajeClasesSueltas", 0.8),
  "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP),
  "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP)
WHERE 
  "montoTotal" IS NULL OR
  "montoCursos" IS NULL OR
  "porcentajeCursos" IS NULL OR
  "porcentajeClasesSueltas" IS NULL OR
  "createdAt" IS NULL OR
  "updatedAt" IS NULL;