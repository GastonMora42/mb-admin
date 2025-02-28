/*
  Warnings:

  - You are about to drop the column `fechaPagoInscripcion` on the `Alumno` table. All the data in the column will be lost.
  - The primary key for the `AlumnoEstilos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `descuentoPersonalizado` on the `AlumnoEstilos` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `AlumnoEstilos` table. All the data in the column will be lost.
  - You are about to drop the column `montoPersonalizado` on the `AlumnoEstilos` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones` on the `AlumnoEstilos` table. All the data in the column will be lost.
  - You are about to drop the column `activo` on the `Concepto` table. All the data in the column will be lost.
  - You are about to drop the column `monto` on the `Concepto` table. All the data in the column will be lost.
  - You are about to drop the column `esInscripcion` on the `Deuda` table. All the data in the column will be lost.
  - You are about to drop the column `fechaPago` on the `Deuda` table. All the data in the column will be lost.
  - You are about to drop the column `montoOriginal` on the `Deuda` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Liquidacion` table. All the data in the column will be lost.
  - You are about to drop the column `fechaPago` on the `Liquidacion` table. All the data in the column will be lost.
  - You are about to drop the column `metodoPago` on the `Liquidacion` table. All the data in the column will be lost.
  - You are about to drop the column `montoClasesSueltas` on the `Liquidacion` table. All the data in the column will be lost.
  - You are about to drop the column `montoCursos` on the `Liquidacion` table. All the data in the column will be lost.
  - You are about to drop the column `montoTotal` on the `Liquidacion` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones` on the `Liquidacion` table. All the data in the column will be lost.
  - You are about to drop the column `porcentajeClasesSueltas` on the `Liquidacion` table. All the data in the column will be lost.
  - You are about to drop the column `porcentajeCursos` on the `Liquidacion` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Liquidacion` table. All the data in the column will be lost.
*/

-- CreateEnum
CREATE TYPE "TipoModalidad" AS ENUM ('REGULAR', 'SUELTA');

-- DropIndex
DROP INDEX IF EXISTS "AlumnoEstilos_activo_idx";

-- AlterTable
ALTER TABLE "Alumno" DROP COLUMN IF EXISTS "fechaPagoInscripcion";

-- Crear la tabla ModalidadClase primero
CREATE TABLE "ModalidadClase" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoModalidad" NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,
    "estiloId" INTEGER NOT NULL,

    CONSTRAINT "ModalidadClase_pkey" PRIMARY KEY ("id")
);

-- Insertar datos iniciales en ModalidadClase (un registro para cada estilo)
INSERT INTO "ModalidadClase" ("tipo", "porcentaje", "estiloId")
SELECT 'REGULAR', 0.60, id FROM "Estilo";

INSERT INTO "ModalidadClase" ("tipo", "porcentaje", "estiloId")
SELECT 'SUELTA', 0.80, id FROM "Estilo";

-- AlterTable AlumnoEstilos
ALTER TABLE "AlumnoEstilos" 
DROP CONSTRAINT IF EXISTS "AlumnoEstilos_pkey",
DROP COLUMN IF EXISTS "descuentoPersonalizado",
DROP COLUMN IF EXISTS "id",
DROP COLUMN IF EXISTS "montoPersonalizado",
DROP COLUMN IF EXISTS "observaciones",
ADD COLUMN "modalidadId" INTEGER;

-- Actualizar AlumnoEstilos con modalidadId basado en el estilo
UPDATE "AlumnoEstilos" ae
SET "modalidadId" = mc.id
FROM "ModalidadClase" mc
WHERE ae."estiloId" = mc."estiloId" AND mc."tipo" = 'REGULAR';

-- Ahora hacemos que modalidadId sea NOT NULL
ALTER TABLE "AlumnoEstilos" ALTER COLUMN "modalidadId" SET NOT NULL;

-- AlterTable Clase
ALTER TABLE "Clase" ADD COLUMN "modalidadId" INTEGER;

-- Actualizar Clase con modalidadId basado en el estilo
UPDATE "Clase" c
SET "modalidadId" = mc.id
FROM "ModalidadClase" mc
WHERE c."estiloId" = mc."estiloId" AND mc."tipo" = 'REGULAR';

-- Ahora hacemos que modalidadId sea NOT NULL
ALTER TABLE "Clase" ALTER COLUMN "modalidadId" SET NOT NULL;

-- Identificar duplicados en Concepto
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE tablename = 'concepto' AND schemaname = 'public'
  ) THEN
    CREATE TEMP TABLE concepto_duplicados AS
    SELECT "estiloId", "esInscripcion", COUNT(*), array_agg(id) as ids
    FROM "Concepto" 
    GROUP BY "estiloId", "esInscripcion"
    HAVING COUNT(*) > 1;

    -- Eliminar duplicados excepto el primero
    DELETE FROM "Concepto"
    WHERE id IN (
        SELECT unnest(ids[2:]) 
        FROM concepto_duplicados
    );

    DROP TABLE concepto_duplicados;
  END IF;
END $$;

-- AlterTable Concepto
ALTER TABLE "Concepto" 
ADD COLUMN IF NOT EXISTS "montoRegular" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "montoSuelto" DOUBLE PRECISION DEFAULT 0;

-- Actualizar Concepto con valores predeterminados
UPDATE "Concepto" c
SET "montoRegular" = 0,
    "montoSuelto" = 0;

-- Ahora hacemos que montoRegular y montoSuelto sean NOT NULL
ALTER TABLE "Concepto" ALTER COLUMN "montoRegular" SET NOT NULL,
                       ALTER COLUMN "montoSuelto" SET NOT NULL;

-- Eliminar columnas si existen
ALTER TABLE "Concepto" 
DROP COLUMN IF EXISTS "monto",
DROP COLUMN IF EXISTS "activo";

-- AlterTable Deuda
ALTER TABLE "Deuda" 
DROP COLUMN IF EXISTS "esInscripcion",
DROP COLUMN IF EXISTS "fechaPago",
DROP COLUMN IF EXISTS "montoOriginal",
ADD COLUMN IF NOT EXISTS "cantidadClases" INTEGER,
ADD COLUMN IF NOT EXISTS "tipoDeuda" "TipoModalidad" DEFAULT 'REGULAR';

-- Actualizar todas las deudas existentes como REGULAR
UPDATE "Deuda" SET "tipoDeuda" = 'REGULAR' WHERE "tipoDeuda" IS NULL;

-- Ahora hacemos que tipoDeuda sea NOT NULL
ALTER TABLE "Deuda" ALTER COLUMN "tipoDeuda" SET NOT NULL;

-- AlterTable Inscripcion
ALTER TABLE "Inscripcion" ADD COLUMN IF NOT EXISTS "conceptoId" INTEGER;

-- Buscar un concepto de inscripción para cada inscripción
UPDATE "Inscripcion" i
SET "conceptoId" = (
    SELECT id FROM "Concepto" 
    WHERE "esInscripcion" = true 
    LIMIT 1
)
WHERE "conceptoId" IS NULL;

-- Si no hay inscripciones, crear un concepto predeterminado
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Concepto" WHERE "esInscripcion" = true LIMIT 1) THEN
    INSERT INTO "Concepto" (nombre, descripcion, "montoRegular", "montoSuelto", "esInscripcion", "createdAt", "updatedAt")
    VALUES ('Inscripción Predeterminada', 'Creado automáticamente', 1000, 1000, true, NOW(), NOW());
    
    UPDATE "Inscripcion" SET "conceptoId" = (SELECT id FROM "Concepto" WHERE "esInscripcion" = true LIMIT 1)
    WHERE "conceptoId" IS NULL;
  END IF;
END $$;

-- Ahora hacemos que conceptoId sea NOT NULL
ALTER TABLE "Inscripcion" ALTER COLUMN "conceptoId" SET NOT NULL;

-- AlterTable Liquidacion
ALTER TABLE "Liquidacion" 
DROP COLUMN IF EXISTS "createdAt",
DROP COLUMN IF EXISTS "fechaPago",
DROP COLUMN IF EXISTS "metodoPago",
DROP COLUMN IF EXISTS "montoClasesSueltas",
DROP COLUMN IF EXISTS "montoCursos",
DROP COLUMN IF EXISTS "montoTotal",
DROP COLUMN IF EXISTS "observaciones",
DROP COLUMN IF EXISTS "porcentajeClasesSueltas",
DROP COLUMN IF EXISTS "porcentajeCursos",
DROP COLUMN IF EXISTS "updatedAt",
ADD COLUMN IF NOT EXISTS "montoTotalRegular" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "montoTotalSueltas" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "porcentajeRegular" DOUBLE PRECISION NOT NULL DEFAULT 0.60,
ADD COLUMN IF NOT EXISTS "porcentajeSueltas" DOUBLE PRECISION NOT NULL DEFAULT 0.80,
ADD COLUMN IF NOT EXISTS "totalLiquidar" DOUBLE PRECISION DEFAULT 0;

-- Actualizar Liquidacion con valores calculados
UPDATE "Liquidacion" l
SET "montoTotalRegular" = 0,
    "montoTotalSueltas" = 0,
    "totalLiquidar" = 0
WHERE "montoTotalRegular" IS NULL OR "montoTotalSueltas" IS NULL OR "totalLiquidar" IS NULL;

-- Ahora hacemos que los campos sean NOT NULL
ALTER TABLE "Liquidacion" ALTER COLUMN "montoTotalRegular" SET NOT NULL,
                          ALTER COLUMN "montoTotalSueltas" SET NOT NULL,
                          ALTER COLUMN "totalLiquidar" SET NOT NULL;

-- CreateIndex (usando IF NOT EXISTS para evitar errores)
CREATE UNIQUE INDEX IF NOT EXISTS "ModalidadClase_estiloId_tipo_key" ON "ModalidadClase"("estiloId", "tipo");

-- Primero eliminar cualquier duplicado en la tabla Concepto antes de crear el índice único
DO $$
BEGIN
  -- Identificar duplicados
  CREATE TEMP TABLE duplicados AS
  SELECT MIN(id) as id_to_keep, "estiloId", "esInscripcion"
  FROM "Concepto"
  GROUP BY "estiloId", "esInscripcion"
  HAVING COUNT(*) > 1;

  -- Actualizar referencias en Inscripcion (si existen)
  UPDATE "Inscripcion" i
  SET "conceptoId" = d.id_to_keep
  FROM duplicados d, "Concepto" c
  WHERE i."conceptoId" = c.id
  AND c."estiloId" = d."estiloId"
  AND c."esInscripcion" = d."esInscripcion"
  AND c.id <> d.id_to_keep;

  -- También actualizar otras tablas con relaciones a Concepto si es necesario
  -- [AÑADIR OTRAS TABLAS AQUÍ SI ES NECESARIO]

  -- Eliminar duplicados
  DELETE FROM "Concepto" c
  USING duplicados d
  WHERE c."estiloId" = d."estiloId"
  AND c."esInscripcion" = d."esInscripcion"
  AND c.id <> d.id_to_keep;

  DROP TABLE duplicados;
END $$;

-- Ahora es seguro crear el índice único
CREATE UNIQUE INDEX IF NOT EXISTS "Concepto_estiloId_esInscripcion_key" ON "Concepto"("estiloId", "esInscripcion");

-- AddForeignKey (usando IF NOT EXISTS donde sea posible)
ALTER TABLE "Inscripcion" 
  ADD CONSTRAINT "Inscripcion_conceptoId_fkey" 
  FOREIGN KEY ("conceptoId") REFERENCES "Concepto"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AlumnoEstilos" 
  ADD CONSTRAINT "AlumnoEstilos_modalidadId_fkey" 
  FOREIGN KEY ("modalidadId") REFERENCES "ModalidadClase"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ModalidadClase" 
  ADD CONSTRAINT "ModalidadClase_estiloId_fkey" 
  FOREIGN KEY ("estiloId") REFERENCES "Estilo"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Clase" 
  ADD CONSTRAINT "Clase_modalidadId_fkey" 
  FOREIGN KEY ("modalidadId") REFERENCES "ModalidadClase"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;