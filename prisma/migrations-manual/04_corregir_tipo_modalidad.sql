-- Primero, respaldamos los datos existentes
CREATE TABLE IF NOT EXISTS "ModalidadClase_backup" AS SELECT * FROM "ModalidadClase";

-- Cambiamos temporalmente el tipo de la columna 'tipo' a text
ALTER TABLE "ModalidadClase" ALTER COLUMN "tipo" TYPE text;

-- Nos aseguramos de que el enum existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipomomdalidad') THEN
        CREATE TYPE "TipoModalidad" AS ENUM ('REGULAR', 'SUELTA');
    END IF;
END$$;

-- Convertimos explícitamente la columna de texto a enum
ALTER TABLE "ModalidadClase" 
  ALTER COLUMN "tipo" TYPE "TipoModalidad" 
  USING "tipo"::"TipoModalidad";

-- Actualizamos tipoDeuda en Deuda también
ALTER TABLE "Deuda" ALTER COLUMN "tipoDeuda" TYPE text;
ALTER TABLE "Deuda" 
  ALTER COLUMN "tipoDeuda" TYPE "TipoModalidad" 
  USING "tipoDeuda"::"TipoModalidad";