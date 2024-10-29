-- AlterTable
ALTER TABLE "Alumno" 
ADD COLUMN "fechaBaja" TIMESTAMP(3),
ADD COLUMN "motivoBaja" TEXT;

-- CreateTable
CREATE TABLE "ConfiguracionPagoAlumno" (
    "id" SERIAL NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "diaPago" INTEGER,
    "metodoPago" "TipoPago" NOT NULL DEFAULT 'EFECTIVO',
    "descuentoFijo" DOUBLE PRECISION,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ConfiguracionPagoAlumno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Descuento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "esAutomatico" BOOLEAN NOT NULL DEFAULT false,
    "minEstilos" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Descuento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DescuentoAplicado" (
    "id" SERIAL NOT NULL,
    "descuentoId" INTEGER NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DescuentoAplicado_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Deuda" 
ADD COLUMN "fechaPago" TIMESTAMP(3),
ADD COLUMN "montoOriginal" DOUBLE PRECISION,
ADD COLUMN "fechaVencimiento" TIMESTAMP(3);

-- Actualizar registros existentes en Deuda
UPDATE "Deuda" 
SET "montoOriginal" = monto,
    "fechaVencimiento" = CURRENT_TIMESTAMP;

-- Hacer las columnas NOT NULL después de la actualización
ALTER TABLE "Deuda" 
ALTER COLUMN "montoOriginal" SET NOT NULL,
ALTER COLUMN "fechaVencimiento" SET NOT NULL;

-- CreateTable
CREATE TABLE "PagoDeuda" (
    "id" SERIAL NOT NULL,
    "deudaId" INTEGER NOT NULL,
    "reciboId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PagoDeuda_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Recibo" 
ADD COLUMN "anulado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "descuento" DOUBLE PRECISION,
ADD COLUMN "esMesCompleto" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "fechaEfecto" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "montoOriginal" DOUBLE PRECISION,
ADD COLUMN "motivoAnulacion" TEXT,
ADD COLUMN "referenciaRecibo" INTEGER;

-- Actualizar registros existentes en Recibo
UPDATE "Recibo"
SET "montoOriginal" = monto;

-- Hacer la columna NOT NULL después de la actualización
ALTER TABLE "Recibo"
ALTER COLUMN "montoOriginal" SET NOT NULL;

-- AlterTable
ALTER TABLE "Profesor" 
ADD COLUMN "cuit" TEXT,
ADD COLUMN "direccion" TEXT,
ADD COLUMN "fechaNacimiento" TIMESTAMP(3),
ADD COLUMN "porcentajePorDefecto" DOUBLE PRECISION NOT NULL DEFAULT 0.60,
ADD COLUMN "porcentajeClasesSueltasPorDefecto" DOUBLE PRECISION NOT NULL DEFAULT 0.80;

-- AlterTable
ALTER TABLE "AlumnoEstilos" 
ADD COLUMN "descuentoPersonalizado" DOUBLE PRECISION,
ADD COLUMN "fechaFin" TIMESTAMP(3),
ADD COLUMN "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "montoPersonalizado" DOUBLE PRECISION,
ADD COLUMN "observaciones" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionPagoAlumno_alumnoId_key" ON "ConfiguracionPagoAlumno"("alumnoId");

-- CreateIndex
CREATE INDEX "PagoDeuda_deudaId_idx" ON "PagoDeuda"("deudaId");

-- CreateIndex
CREATE INDEX "Deuda_alumnoId_mes_anio_idx" ON "Deuda"("alumnoId", "mes", "anio");

-- CreateIndex
CREATE INDEX "Recibo_fecha_idx" ON "Recibo"("fecha");

-- CreateIndex
CREATE INDEX "Recibo_alumnoId_fecha_idx" ON "Recibo"("alumnoId", "fecha");

-- CreateIndex
CREATE INDEX "AlumnoEstilos_activo_idx" ON "AlumnoEstilos"("activo");

-- AddForeignKey
ALTER TABLE "ConfiguracionPagoAlumno" ADD CONSTRAINT "ConfiguracionPagoAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DescuentoAplicado" ADD CONSTRAINT "DescuentoAplicado_descuentoId_fkey" FOREIGN KEY ("descuentoId") REFERENCES "Descuento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DescuentoAplicado" ADD CONSTRAINT "DescuentoAplicado_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoDeuda" ADD CONSTRAINT "PagoDeuda_deudaId_fkey" FOREIGN KEY ("deudaId") REFERENCES "Deuda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoDeuda" ADD CONSTRAINT "PagoDeuda_reciboId_fkey" FOREIGN KEY ("reciboId") REFERENCES "Recibo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recibo" ADD CONSTRAINT "Recibo_referenciaRecibo_fkey" FOREIGN KEY ("referenciaRecibo") REFERENCES "Recibo"("id") ON DELETE SET NULL ON UPDATE CASCADE;