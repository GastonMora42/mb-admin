-- Crear el tipo enum TipoModalidad si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipomomdalidad') THEN
        CREATE TYPE "TipoModalidad" AS ENUM ('REGULAR', 'SUELTA');
    END IF;
END$$;

-- Crear la tabla ModalidadClase si no existe
CREATE TABLE IF NOT EXISTS "ModalidadClase" (
  "id" SERIAL PRIMARY KEY,
  "tipo" "TipoModalidad" NOT NULL,
  "porcentaje" FLOAT NOT NULL,
  "estiloId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("estiloId") REFERENCES "Estilo"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Asegúrate de que modalidadId se puede añadir a AlumnoEstilos
ALTER TABLE "AlumnoEstilos" ADD COLUMN IF NOT EXISTS "modalidadId" INTEGER;

-- Asegúrate de que modalidadId se puede añadir a Clase
ALTER TABLE "Clase" ADD COLUMN IF NOT EXISTS "modalidadId" INTEGER;

-- Asegúrate de que tipoDeuda se puede añadir a Deuda
ALTER TABLE "Deuda" ADD COLUMN IF NOT EXISTS "tipoDeuda" "TipoModalidad";