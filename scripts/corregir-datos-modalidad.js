// scripts/corregir-datos-modalidad.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function corregirDatosModalidad() {
  try {
    console.log('Iniciando corrección de datos de modalidad...');
    
    // 1. Crear modalidades para cada estilo (usando SQL directo)
    console.log('Creando modalidades para estilos...');
    const estilos = await prisma.$queryRaw`SELECT id, nombre FROM "Estilo"`;
    
    for (const estilo of estilos) {
      console.log(`Procesando estilo ${estilo.id} (${estilo.nombre})`);
      
      // Crear modalidad REGULAR
      await prisma.$executeRawUnsafe(`
        INSERT INTO "ModalidadClase" ("tipo", "porcentaje", "estiloId")
        VALUES ('REGULAR', 0.6, ${estilo.id})
        ON CONFLICT DO NOTHING
      `);
      
      // Crear modalidad SUELTA
      await prisma.$executeRawUnsafe(`
        INSERT INTO "ModalidadClase" ("tipo", "porcentaje", "estiloId")
        VALUES ('SUELTA', 0.8, ${estilo.id})
        ON CONFLICT DO NOTHING
      `);
    }
    
    // 2. Actualizar AlumnoEstilos - asignarles la modalidad regular
    console.log('Actualizando AlumnoEstilos...');
    await prisma.$executeRawUnsafe(`
      UPDATE "AlumnoEstilos" AS ae
      SET "modalidadId" = mc.id
      FROM "ModalidadClase" AS mc
      WHERE ae."estiloId" = mc."estiloId"
        AND mc.tipo = 'REGULAR'
        AND ae."modalidadId" IS NULL
    `);
    
    // 3. Actualizar Clases - asignarles la modalidad regular
    console.log('Actualizando Clases...');
    await prisma.$executeRawUnsafe(`
      UPDATE "Clase" AS c
      SET "modalidadId" = mc.id
      FROM "ModalidadClase" AS mc
      WHERE c."estiloId" = mc."estiloId"
        AND mc.tipo = 'REGULAR'
        AND c."modalidadId" IS NULL
    `);
    
    // 4. Actualizar Deudas - establecer el tipo a REGULAR
    console.log('Actualizando Deudas...');
    await prisma.$executeRawUnsafe(`
      UPDATE "Deuda"
      SET "tipoDeuda" = 'REGULAR'
      WHERE "tipoDeuda" IS NULL
    `);
    
    console.log('Corrección de datos de modalidad completada');
  } catch (error) {
    console.error('Error durante la corrección de datos:', error);
    console.error(error.stack);
  }
}

corregirDatosModalidad()
  .finally(async () => {
    await prisma.$disconnect();
  });