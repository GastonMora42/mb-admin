import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateDNIs() {
  const alumnosSueltos = await prisma.alumnoSuelto.findMany()
  
  for (const alumno of alumnosSueltos) {
    await prisma.alumnoSuelto.update({
      where: { id: alumno.id },
      data: { dni: `DNI${alumno.id.toString().padStart(6, '0')}` }
    })
  }

  console.log('DNIs actualizados con éxito')
}

updateDNIs()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())