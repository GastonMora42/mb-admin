// pages/api/conceptos/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const conceptos = await prisma.concepto.findMany({
        include: {
          estilo: {
            include: {
              profesor: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true
                }
              }
            }
          }
        },
        orderBy: { 
          nombre: 'asc' 
        }
      });
      res.status(200).json(conceptos);
    } catch (error) {
      console.error('Error al obtener conceptos:', error);
      res.status(500).json({ error: 'Error al obtener conceptos' });
    }
  } 
  
  else if (req.method === 'POST') {
    try {
      // Actualizar para usar montoRegular y montoSuelto en lugar de monto
      const { 
        nombre, 
        descripcion, 
        montoRegular, 
        montoSuelto, 
        estiloId, 
        esClaseSuelta, 
        esInscripcion 
      } = req.body;
  
      const conceptoData = {
        nombre,
        descripcion,
        montoRegular: Number(montoRegular),
        montoSuelto: montoSuelto ? Number(montoSuelto) : Number(montoRegular), // Si no hay montoSuelto, usar montoRegular
        esInscripcion: Boolean(esInscripcion),
        ...(estiloId && {
          estilo: {
            connect: { id: Number(estiloId) }
          }
        })
      };
  
      const concepto = await prisma.concepto.create({
        data: conceptoData,
        include: {
          estilo: {
            include: {
              profesor: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true
                }
              }
            }
          }
        }
      });
  
      res.status(201).json(concepto);
    } catch (error) {
      console.error('Error al crear concepto:', error);
      // Mostrar mensaje de error más detallado
      res.status(400).json({ 
        error: 'Error al crear concepto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
  
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}