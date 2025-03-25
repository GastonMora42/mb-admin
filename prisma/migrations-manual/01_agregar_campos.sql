-- Añadir nuevas columnas a Concepto
ALTER TABLE "Concepto" ADD COLUMN IF NOT EXISTS "montoRegular" FLOAT;
ALTER TABLE "Concepto" ADD COLUMN IF NOT EXISTS "montoSuelto" FLOAT;

-- Inicializar los nuevos campos
UPDATE "Concepto" SET "montoRegular" = monto, "montoSuelto" = monto;

-- Añadir columna conceptoId a Inscripcion
ALTER TABLE "Inscripcion" ADD COLUMN IF NOT EXISTS "conceptoId" INTEGER;

-- Crear la tabla ModalidadClase si no existe
CREATE TABLE IF NOT EXISTS "ModalidadClase" (
  "id" SERIAL PRIMARY KEY,
  "tipo" TEXT NOT NULL,
  "porcentaje" FLOAT NOT NULL,
  "estiloId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("estiloId") REFERENCES "Estilo"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Añadir modalidadId a AlumnoEstilos
ALTER TABLE "AlumnoEstilos" ADD COLUMN IF NOT EXISTS "modalidadId" INTEGER;

-- Añadir modalidadId a Clase
ALTER TABLE "Clase" ADD COLUMN IF NOT EXISTS "modalidadId" INTEGER;

-- Añadir campo tipoDeuda a Deuda
ALTER TABLE "Deuda" ADD COLUMN IF NOT EXISTS "tipoDeuda" TEXT;
ALTER TABLE "Deuda" ADD COLUMN IF NOT EXISTS "cantidadClases" INTEGER;