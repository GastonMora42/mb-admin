-- Hacer que montoOriginal sea opcional (aceptar NULL)
ALTER TABLE "Deuda" ALTER COLUMN "montoOriginal" DROP NOT NULL;

-- Establecer un valor predeterminado para el campo
ALTER TABLE "Deuda" ALTER COLUMN "montoOriginal" SET DEFAULT 0;

-- Actualizar registros existentes que tengan NULL
UPDATE "Deuda" SET "montoOriginal" = monto WHERE "montoOriginal" IS NULL;