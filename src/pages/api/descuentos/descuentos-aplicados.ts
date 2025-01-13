import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface WhereClause {
 alumnoId?: number;
 activo?: boolean;
}

interface PostBody {
 descuentoId: string;
 alumnoId: string;
 fechaInicio?: string;
 fechaFin?: string;
}

interface PutBody {
 id: string;
 activo: boolean;
 fechaFin?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 if (req.method === 'GET') {
   const { alumnoId, activo } = req.query;
   
   const whereClause: WhereClause = {};
   
   if (alumnoId) {
     whereClause.alumnoId = parseInt(String(alumnoId), 10);
   }
   if (activo !== undefined) {
     whereClause.activo = activo === 'true';
   }

   try {
     const descuentosAplicados = await prisma.descuentoAplicado.findMany({
       where: whereClause as Prisma.DescuentoAplicadoWhereInput,
       include: {
         descuento: true,
         alumno: true
       },
       orderBy: {
         createdAt: 'desc'
       }
     });

     res.status(200).json(descuentosAplicados);
   } catch (error) {
     console.error('Error al obtener descuentos aplicados:', error);
     res.status(500).json({ error: 'Error al obtener descuentos aplicados' });
   }
 } else if (req.method === 'POST') {
   try {
     const { descuentoId, alumnoId, fechaInicio, fechaFin }: PostBody = req.body;

     const descuentoExistente = await prisma.descuentoAplicado.findFirst({
       where: {
         alumnoId: parseInt(alumnoId, 10),
         activo: true,
         descuento: {
           esAutomatico: false
         }
       }
     });

     if (descuentoExistente) {
       return res.status(400).json({ 
         error: 'El alumno ya tiene un descuento activo' 
       });
     }

     const descuentoAplicado = await prisma.descuentoAplicado.create({
       data: {
         descuento: { connect: { id: parseInt(descuentoId, 10) } },
         alumno: { connect: { id: parseInt(alumnoId, 10) } },
         fechaInicio: fechaInicio ? new Date(fechaInicio) : new Date(),
         fechaFin: fechaFin ? new Date(fechaFin) : null,
       },
       include: {
         descuento: true,
         alumno: true
       }
     });

     res.status(201).json(descuentoAplicado);
   } catch (error) {
     console.error('Error al aplicar descuento:', error);
     res.status(400).json({ error: 'Error al aplicar descuento' });
   }
 } else if (req.method === 'PUT') {
   try {
     const { id, activo, fechaFin }: PutBody = req.body;

     const descuentoAplicado = await prisma.descuentoAplicado.update({
       where: { 
         id: parseInt(id, 10) 
       },
       data: {
         activo,
         fechaFin: fechaFin ? new Date(fechaFin) : null
       },
       include: {
         descuento: true,
         alumno: true
       }
     });

     res.status(200).json(descuentoAplicado);
   } catch (error) {
     console.error('Error al actualizar descuento aplicado:', error);
     res.status(400).json({ error: 'Error al actualizar descuento aplicado' });
   }
 } else {
   res.setHeader('Allow', ['GET', 'POST', 'PUT']);
   res.status(405).end(`Method ${req.method} Not Allowed`);
 }
}