// scripts/migrar-datos-manualmente.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function migrarDatos() {
  console.log('Iniciando migración de datos...')
  
  try {
    // 1. Buscar o crear un concepto de inscripción
    let conceptoInscripcion = await prisma.concepto.findFirst({
      where: { esInscripcion: true }
    })
    
    if (!conceptoInscripcion) {
      console.log('Creando concepto de inscripción...')
      conceptoInscripcion = await prisma.concepto.create({
        data: {
          nombre: "Inscripción",
          esInscripcion: true,
          monto: 0,
          montoRegular: 0,
          montoSuelto: 0
        }
      })
    }
    
    // 2. Actualizar inscripciones existentes
    console.log('Actualizando inscripciones...')
    await prisma.$executeRaw`
      UPDATE "Inscripcion" 
      SET "conceptoId" = ${conceptoInscripcion.id}
      WHERE "conceptoId" IS NULL
    `
    
    // 3. Crear modalidades para cada estilo
    console.log('Creando modalidades para estilos...')
    const estilos = await prisma.estilo.findMany()
    
    for (const estilo of estilos) {
      // Crear modalidad REGULAR
      const modalidadRegular = await prisma.$executeRaw`
        INSERT INTO "ModalidadClase" ("tipo", "porcentaje", "estiloId")
        VALUES ('REGULAR', 0.6, ${estilo.id})
        ON CONFLICT ("estiloId", "tipo") DO NOTHING
        RETURNING id
      `
      
      // Crear modalidad SUELTA
      const modalidadSuelta = await prisma.$executeRaw`
        INSERT INTO "ModalidadClase" ("tipo", "porcentaje", "estiloId")
        VALUES ('SUELTA', 0.8, ${estilo.id})
        ON CONFLICT ("estiloId", "tipo") DO NOTHING
        RETURNING id
      `
    }
    
    // 4. Obtener modalidades creadas
    const modalidades = await prisma.$queryRaw`SELECT * FROM "ModalidadClase"`
    console.log('Modalidades creadas:', modalidades)
    
    // 5. Asignar modalidad REGULAR a AlumnoEstilos existentes
    console.log('Asignando modalidad a AlumnoEstilos...')
    for (const estilo of estilos) {
      const modalidadRegular = await prisma.$queryRaw`
        SELECT id FROM "ModalidadClase" 
        WHERE "estiloId" = ${estilo.id} AND "tipo" = 'REGULAR' 
        LIMIT 1
      `
      
      if (modalidadRegular && modalidadRegular.length > 0) {
        await prisma.$executeRaw`
          UPDATE "AlumnoEstilos"
          SET "modalidadId" = ${modalidadRegular[0].id}
          WHERE "estiloId" = ${estilo.id} AND "modalidadId" IS NULL
        `
      }
    }
    
    // 6. Asignar tipo REGULAR a Deudas existentes
    console.log('Actualizando deudas...')
    await prisma.$executeRaw`
      UPDATE "Deuda"
      SET "tipoDeuda" = 'REGULAR'
      WHERE "tipoDeuda" IS NULL
    `
    
    console.log('Migración de datos completada con éxito')
  } catch (error) {
    console.error('Error durante la migración:', error)
  }
}

migrarDatos()
  .finally(async () => {
    await prisma.$disconnect()
  })