-- AlterTable
ALTER TABLE "Estilo" ADD COLUMN "monto" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Deuda" (
    "id" SERIAL NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "mes" TEXT NOT NULL,
    "año" INTEGER NOT NULL,
    "estiloId" INTEGER NOT NULL,
    "pagada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deuda_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Alumno" ADD COLUMN "numeroEmergencia" TEXT,
                     ADD COLUMN "direccion" TEXT,
                     ADD COLUMN "obraSocial" TEXT,
                     ADD COLUMN "nombreTutor" TEXT,
                     ADD COLUMN "dniTutor" TEXT,
                     ADD COLUMN "notas" TEXT;

-- AddForeignKey
ALTER TABLE "Deuda" ADD CONSTRAINT "Deuda_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deuda" ADD CONSTRAINT "Deuda_estiloId_fkey" FOREIGN KEY ("estiloId") REFERENCES "Estilo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;