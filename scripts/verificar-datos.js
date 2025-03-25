const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarDatos() {
  try {
    const conceptos = await prisma.concepto.findMany();
    console.log('Conceptos:', conceptos);
    
    const modalidades = await prisma.modalidadClase.findMany();
    console.log('Modalidades:', modalidades);
    
    const inscripciones = await prisma.inscripcion.findMany();
    console.log('Inscripciones:', inscripciones);
    
    const deudas = await prisma.deuda.findMany();
    console.log('Deudas:', deudas);
  } catch (error) {
    console.error('Error al verificar datos:', error);
  }
}

verificarDatos()
  .finally(async () => {
    await prisma.$disconnect();
  });