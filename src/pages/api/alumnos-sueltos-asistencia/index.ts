import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { CognitoJwtVerifier } from "aws-jwt-verify";

const verifier = CognitoJwtVerifier.create({
  userPoolId: "us-east-1_OpCljWDF7",
  tokenUse: "access",
  clientId: "7tmctt10ht1q3tff359eii7jv0",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
  }

  try {
    await verifier.verify(token);

    switch (req.method) {
      case 'GET':
        if (req.query.type === 'alumnos-sueltos') {
          const alumnosSueltos = await prisma.alumnoSuelto.findMany({
            orderBy: { createdAt: 'desc' },
          });
          res.status(200).json(alumnosSueltos);
        } else if (req.query.type === 'clases') {
          const { fechaInicio, fechaFin } = req.query;
          const clases = await prisma.clase.findMany({
            where: {
              fecha: {
                gte: new Date(fechaInicio as string),
                lte: new Date(fechaFin as string),
              },
            },
            include: {
              profesor: true,
              estilo: true,
              asistencias: {
                include: {
                  alumno: true,
                },
              },
              alumnosSueltos: true,
            },
            orderBy: { fecha: 'desc' },
          });
          res.status(200).json(clases);
        } else {
          res.status(400).json({ error: 'Tipo de consulta no válido' });
        }
        break;

      case 'DELETE':
        if (req.query.type === 'alumno-suelto') {
          const { id } = req.query;
          await prisma.alumnoSuelto.delete({
            where: { id: Number(id) },
          });
          res.status(200).json({ message: 'Alumno suelto eliminado con éxito' });
        } else if (req.query.type === 'clase') {
          const { id } = req.query;
          try {
            await prisma.$transaction(async (prisma) => {
              await prisma.asistencia.deleteMany({
                where: { claseId: Number(id) },
              });
              await prisma.alumnoSuelto.deleteMany({
                where: { claseId: Number(id) },
              });
              await prisma.clase.delete({
                where: { id: Number(id) },
              });
            });
            res.status(200).json({ message: 'Clase y registros asociados eliminados con éxito' });
          } catch (error) {
            console.error('Error al eliminar la clase:', error);
            res.status(500).json({ error: 'Error al eliminar la clase y sus registros asociados' });
          }
        } else {
          res.status(400).json({ error: 'Tipo de eliminación no válido' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}