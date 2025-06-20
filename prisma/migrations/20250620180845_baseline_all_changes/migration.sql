-- CreateEnum
CREATE TYPE "TipoModalidad" AS ENUM ('REGULAR', 'SUELTA');

-- CreateEnum
CREATE TYPE "TipoLiquidacion" AS ENUM ('PORCENTAJE', 'MONTO_FIJO');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('EFECTIVO', 'MERCADO_PAGO', 'TRANSFERENCIA', 'DEBITO_AUTOMATICO', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoLiquidacion" AS ENUM ('PENDIENTE', 'PAGADA', 'ANULADA');

-- CreateTable
CREATE TABLE "Alumno" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "numeroEmergencia" TEXT,
    "direccion" TEXT,
    "obraSocial" TEXT,
    "nombreTutor" TEXT,
    "dniTutor" TEXT,
    "notas" TEXT,
    "fechaBaja" TIMESTAMP(3),
    "motivoBaja" TEXT,
    "fechaPagoInscripcion" TIMESTAMP(3),
    "inscripcionPagada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Alumno_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Deuda" (
    "id" SERIAL NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "mes" TEXT NOT NULL,
    "estiloId" INTEGER NOT NULL,
    "pagada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "anio" INTEGER NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "montoOriginal" DOUBLE PRECISION DEFAULT 0,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "conceptoId" INTEGER,
    "esInscripcion" BOOLEAN NOT NULL DEFAULT false,
    "tipoDeuda" "TipoModalidad",
    "cantidadClases" INTEGER,

    CONSTRAINT "Deuda_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Inscripcion" (
    "id" SERIAL NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "pagada" BOOLEAN NOT NULL DEFAULT false,
    "fechaPago" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "conceptoId" INTEGER,

    CONSTRAINT "Inscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Concepto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "monto" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "estiloId" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "esInscripcion" BOOLEAN NOT NULL DEFAULT false,
    "montoRegular" DOUBLE PRECISION,
    "montoSuelto" DOUBLE PRECISION,

    CONSTRAINT "Concepto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recibo" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DOUBLE PRECISION NOT NULL,
    "alumnoId" INTEGER,
    "conceptoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "numeroRecibo" SERIAL NOT NULL,
    "periodoPago" TEXT NOT NULL,
    "tipoPago" "TipoPago" NOT NULL,
    "fueraDeTermino" BOOLEAN NOT NULL DEFAULT false,
    "claseId" INTEGER,
    "esClaseSuelta" BOOLEAN NOT NULL DEFAULT false,
    "alumnoSueltoId" INTEGER,
    "anulado" BOOLEAN NOT NULL DEFAULT false,
    "descuento" DOUBLE PRECISION,
    "esMesCompleto" BOOLEAN NOT NULL DEFAULT false,
    "fechaEfecto" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "montoOriginal" DOUBLE PRECISION NOT NULL,
    "motivoAnulacion" TEXT,
    "referenciaRecibo" INTEGER,

    CONSTRAINT "Recibo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estilo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profesorId" INTEGER,
    "monto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "importe" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Estilo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumnoEstilos" (
    "alumnoId" INTEGER NOT NULL,
    "estiloId" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "id" SERIAL NOT NULL,
    "descuentoPersonalizado" DOUBLE PRECISION,
    "fechaFin" TIMESTAMP(3),
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "montoPersonalizado" DOUBLE PRECISION,
    "observaciones" TEXT,
    "modalidadId" INTEGER,

    CONSTRAINT "AlumnoEstilos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModalidadClase" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoModalidad" NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,
    "estiloId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModalidadClase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profesor" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cuit" TEXT,
    "direccion" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "porcentajePorDefecto" DOUBLE PRECISION NOT NULL DEFAULT 0.60,
    "porcentajeClasesSueltasPorDefecto" DOUBLE PRECISION NOT NULL DEFAULT 0.80,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "montoFijoRegular" DOUBLE PRECISION DEFAULT 0,
    "montoFijoSueltas" DOUBLE PRECISION DEFAULT 0,
    "tipoLiquidacionRegular" "TipoLiquidacion" DEFAULT 'PORCENTAJE',
    "tipoLiquidacionSueltas" "TipoLiquidacion" DEFAULT 'PORCENTAJE',

    CONSTRAINT "Profesor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CtaCte" (
    "id" SERIAL NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CtaCte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CajaDiaria" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apertura" DOUBLE PRECISION NOT NULL,
    "cierre" DOUBLE PRECISION NOT NULL,
    "diferencia" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CajaDiaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clase" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profesorId" INTEGER NOT NULL,
    "estiloId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "modalidadId" INTEGER,

    CONSTRAINT "Clase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asistencia" (
    "id" SERIAL NOT NULL,
    "claseId" INTEGER NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "asistio" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumnoSuelto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dni" TEXT NOT NULL,
    "alumnoRegularId" INTEGER,

    CONSTRAINT "AlumnoSuelto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Liquidacion" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profesorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anio" INTEGER NOT NULL,
    "estado" "EstadoLiquidacion" NOT NULL DEFAULT 'PENDIENTE',
    "fechaPago" TIMESTAMP(3),
    "mes" INTEGER NOT NULL,
    "metodoPago" "TipoPago",
    "montoClasesSueltas" DOUBLE PRECISION DEFAULT 0,
    "montoCursos" DOUBLE PRECISION DEFAULT 0,
    "montoTotal" DOUBLE PRECISION DEFAULT 0,
    "observaciones" TEXT,
    "porcentajeClasesSueltas" DOUBLE PRECISION DEFAULT 0.8,
    "porcentajeCursos" DOUBLE PRECISION DEFAULT 0.6,
    "montoTotalRegular" DOUBLE PRECISION DEFAULT 0,
    "montoTotalSueltas" DOUBLE PRECISION DEFAULT 0,
    "totalLiquidar" DOUBLE PRECISION DEFAULT 0,
    "porcentajeRegular" DOUBLE PRECISION DEFAULT 0.6,
    "porcentajeSueltas" DOUBLE PRECISION DEFAULT 0.8,
    "tipoLiquidacionRegular" "TipoLiquidacion" DEFAULT 'PORCENTAJE',
    "tipoLiquidacionSueltas" "TipoLiquidacion" DEFAULT 'PORCENTAJE',
    "montoFijoRegular" DOUBLE PRECISION,
    "montoFijoSueltas" DOUBLE PRECISION,

    CONSTRAINT "Liquidacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleLiquidacion" (
    "id" SERIAL NOT NULL,
    "liquidacionId" INTEGER NOT NULL,
    "reciboId" INTEGER,
    "montoOriginal" DOUBLE PRECISION NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,
    "montoLiquidado" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DetalleLiquidacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModalidadClase_backup" (
    "id" INTEGER,
    "tipo" TEXT,
    "porcentaje" DOUBLE PRECISION,
    "estiloId" INTEGER,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "_AlumnoEstilos" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AlumnoSueltoToClase" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Alumno_dni_key" ON "Alumno"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionPagoAlumno_alumnoId_key" ON "ConfiguracionPagoAlumno"("alumnoId");

-- CreateIndex
CREATE INDEX "Deuda_alumnoId_mes_anio_idx" ON "Deuda"("alumnoId", "mes", "anio");

-- CreateIndex
CREATE INDEX "PagoDeuda_deudaId_idx" ON "PagoDeuda"("deudaId");

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_alumnoId_key" ON "Inscripcion"("alumnoId");

-- CreateIndex
CREATE UNIQUE INDEX "Recibo_numeroRecibo_key" ON "Recibo"("numeroRecibo");

-- CreateIndex
CREATE INDEX "Recibo_fecha_idx" ON "Recibo"("fecha");

-- CreateIndex
CREATE INDEX "Recibo_alumnoId_fecha_idx" ON "Recibo"("alumnoId", "fecha");

-- CreateIndex
CREATE INDEX "AlumnoEstilos_activo_idx" ON "AlumnoEstilos"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "AlumnoEstilos_alumnoId_estiloId_key" ON "AlumnoEstilos"("alumnoId", "estiloId");

-- CreateIndex
CREATE UNIQUE INDEX "Profesor_dni_key" ON "Profesor"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "CtaCte_alumnoId_key" ON "CtaCte"("alumnoId");

-- CreateIndex
CREATE UNIQUE INDEX "CajaDiaria_fecha_key" ON "CajaDiaria"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "AlumnoSuelto_dni_key" ON "AlumnoSuelto"("dni");

-- CreateIndex
CREATE INDEX "Liquidacion_mes_anio_idx" ON "Liquidacion"("mes", "anio");

-- CreateIndex
CREATE INDEX "Liquidacion_profesorId_idx" ON "Liquidacion"("profesorId");

-- CreateIndex
CREATE UNIQUE INDEX "_AlumnoEstilos_AB_unique" ON "_AlumnoEstilos"("A", "B");

-- CreateIndex
CREATE INDEX "_AlumnoEstilos_B_index" ON "_AlumnoEstilos"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AlumnoSueltoToClase_AB_unique" ON "_AlumnoSueltoToClase"("A", "B");

-- CreateIndex
CREATE INDEX "_AlumnoSueltoToClase_B_index" ON "_AlumnoSueltoToClase"("B");

-- AddForeignKey
ALTER TABLE "ConfiguracionPagoAlumno" ADD CONSTRAINT "ConfiguracionPagoAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DescuentoAplicado" ADD CONSTRAINT "DescuentoAplicado_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DescuentoAplicado" ADD CONSTRAINT "DescuentoAplicado_descuentoId_fkey" FOREIGN KEY ("descuentoId") REFERENCES "Descuento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deuda" ADD CONSTRAINT "Deuda_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deuda" ADD CONSTRAINT "Deuda_conceptoId_fkey" FOREIGN KEY ("conceptoId") REFERENCES "Concepto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deuda" ADD CONSTRAINT "Deuda_estiloId_fkey" FOREIGN KEY ("estiloId") REFERENCES "Estilo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoDeuda" ADD CONSTRAINT "PagoDeuda_deudaId_fkey" FOREIGN KEY ("deudaId") REFERENCES "Deuda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoDeuda" ADD CONSTRAINT "PagoDeuda_reciboId_fkey" FOREIGN KEY ("reciboId") REFERENCES "Recibo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concepto" ADD CONSTRAINT "Concepto_estiloId_fkey" FOREIGN KEY ("estiloId") REFERENCES "Estilo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recibo" ADD CONSTRAINT "Recibo_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recibo" ADD CONSTRAINT "Recibo_alumnoSueltoId_fkey" FOREIGN KEY ("alumnoSueltoId") REFERENCES "AlumnoSuelto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recibo" ADD CONSTRAINT "Recibo_claseId_fkey" FOREIGN KEY ("claseId") REFERENCES "Clase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recibo" ADD CONSTRAINT "Recibo_conceptoId_fkey" FOREIGN KEY ("conceptoId") REFERENCES "Concepto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recibo" ADD CONSTRAINT "Recibo_referenciaRecibo_fkey" FOREIGN KEY ("referenciaRecibo") REFERENCES "Recibo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estilo" ADD CONSTRAINT "Estilo_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumnoEstilos" ADD CONSTRAINT "AlumnoEstilos_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumnoEstilos" ADD CONSTRAINT "AlumnoEstilos_estiloId_fkey" FOREIGN KEY ("estiloId") REFERENCES "Estilo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModalidadClase" ADD CONSTRAINT "ModalidadClase_estiloId_fkey" FOREIGN KEY ("estiloId") REFERENCES "Estilo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtaCte" ADD CONSTRAINT "CtaCte_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clase" ADD CONSTRAINT "Clase_estiloId_fkey" FOREIGN KEY ("estiloId") REFERENCES "Estilo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clase" ADD CONSTRAINT "Clase_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_claseId_fkey" FOREIGN KEY ("claseId") REFERENCES "Clase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumnoSuelto" ADD CONSTRAINT "AlumnoSuelto_alumnoRegularId_fkey" FOREIGN KEY ("alumnoRegularId") REFERENCES "Alumno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liquidacion" ADD CONSTRAINT "Liquidacion_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleLiquidacion" ADD CONSTRAINT "DetalleLiquidacion_liquidacionId_fkey" FOREIGN KEY ("liquidacionId") REFERENCES "Liquidacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleLiquidacion" ADD CONSTRAINT "DetalleLiquidacion_reciboId_fkey" FOREIGN KEY ("reciboId") REFERENCES "Recibo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlumnoEstilos" ADD CONSTRAINT "_AlumnoEstilos_A_fkey" FOREIGN KEY ("A") REFERENCES "Alumno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlumnoEstilos" ADD CONSTRAINT "_AlumnoEstilos_B_fkey" FOREIGN KEY ("B") REFERENCES "Estilo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlumnoSueltoToClase" ADD CONSTRAINT "_AlumnoSueltoToClase_A_fkey" FOREIGN KEY ("A") REFERENCES "AlumnoSuelto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlumnoSueltoToClase" ADD CONSTRAINT "_AlumnoSueltoToClase_B_fkey" FOREIGN KEY ("B") REFERENCES "Clase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

