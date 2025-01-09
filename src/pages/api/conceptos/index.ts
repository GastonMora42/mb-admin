import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
      const { 
        nombre, 
        descripcion, 
        monto, 
        estiloId  // Agregamos estiloId
      } = req.body;

      // Validaciones
      if (!nombre || !monto) {
        return res.status(400).json({ 
          error: 'Nombre y monto son requeridos' 
        });
      }

      const conceptoData: any = {
        nombre,
        descripcion,
        monto: parseFloat(monto)
      };

      // Si se proporciona un estiloId, conectamos el concepto con el estilo
      if (estiloId) {
        // Verificar que el estilo existe
        const estiloExiste = await prisma.estilo.findUnique({
          where: { id: parseInt(estiloId) }
        });

        if (!estiloExiste) {
          return res.status(400).json({ 
            error: 'El estilo especificado no existe' 
          });
        }

        conceptoData.estilo = {
          connect: { id: parseInt(estiloId) }
        };
      }

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
      res.status(400).json({ 
        error: 'Error al crear concepto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Agregar método PATCH para actualizar conceptos
  else if (req.method === 'PATCH') {
    try {
      const { id } = req.query;
      const { 
        nombre, 
        descripcion, 
        monto, 
        estiloId 
      } = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ 
          error: 'ID de concepto no válido' 
        });
      }

      const updateData: any = {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(monto && { monto: parseFloat(monto) })
      };

      // Actualizar relación con estilo si se proporciona
      if (estiloId !== undefined) {
        if (estiloId === null) {
          updateData.estilo = { disconnect: true };
        } else {
          const estiloExiste = await prisma.estilo.findUnique({
            where: { id: parseInt(estiloId) }
          });

          if (!estiloExiste) {
            return res.status(400).json({ 
              error: 'El estilo especificado no existe' 
            });
          }

          updateData.estilo = {
            connect: { id: parseInt(estiloId) }
          };
        }
      }

      const conceptoActualizado = await prisma.concepto.update({
        where: { id: parseInt(id) },
        data: updateData,
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

      res.status(200).json(conceptoActualizado);
    } catch (error) {
      console.error('Error al actualizar concepto:', error);
      res.status(400).json({ 
        error: 'Error al actualizar concepto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}