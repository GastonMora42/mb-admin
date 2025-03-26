-- Modificar campos para permitir valores por defecto
ALTER TABLE "Liquidacion" 
  ALTER COLUMN "montoCursos" SET DEFAULT 0,
  ALTER COLUMN "montoCursos" DROP NOT NULL,
  ALTER COLUMN "montoClasesSueltas" SET DEFAULT 0,
  ALTER COLUMN "montoClasesSueltas" DROP NOT NULL,
  ALTER COLUMN "montoTotal" SET DEFAULT 0,
  ALTER COLUMN "montoTotal" DROP NOT NULL,
  ALTER COLUMN "porcentajeCursos" SET DEFAULT 0.6,
  ALTER COLUMN "porcentajeCursos" DROP NOT NULL,
  ALTER COLUMN "porcentajeClasesSueltas" SET DEFAULT 0.8,
  ALTER COLUMN "porcentajeClasesSueltas" DROP NOT NULL;

-- Actualizar todos los registros que tengan campos nulos
UPDATE "Liquidacion"
SET 
  "montoCursos" = COALESCE("montoCursos", "montoTotalRegular", 0),
  "montoClasesSueltas" = COALESCE("montoClasesSueltas", "montoTotalSueltas", 0),
  "montoTotal" = COALESCE("montoTotal", "totalLiquidar", 0),
  "porcentajeCursos" = COALESCE("porcentajeCursos", "porcentajeRegular", 0.6),
  "porcentajeClasesSueltas" = COALESCE("porcentajeClasesSueltas", "porcentajeSueltas", 0.8)
WHERE 
  "montoCursos" IS NULL OR
  "montoClasesSueltas" IS NULL OR
  "montoTotal" IS NULL OR
  "porcentajeCursos" IS NULL OR
  "porcentajeClasesSueltas" IS NULL;