-- CreateTable
CREATE TABLE "AlumnoEstilos" (
    "alumnoId" INTEGER NOT NULL,
    "estiloId" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AlumnoEstilos_pkey" PRIMARY KEY ("alumnoId","estiloId")
);

-- AddForeignKey
ALTER TABLE "AlumnoEstilos" ADD CONSTRAINT "AlumnoEstilos_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumnoEstilos" ADD CONSTRAINT "AlumnoEstilos_estiloId_fkey" FOREIGN KEY ("estiloId") REFERENCES "Estilo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
