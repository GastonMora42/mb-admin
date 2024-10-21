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
        await handleGetRequest(req, res);
        break;

      case 'DELETE':
        await handleDeleteRequest(req, res);
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

async function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.type === 'alumnos-sueltos') {
    const alumnosSueltos = await prisma.alumnoSuelto.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(alumnosSueltos);
  } else if (req.query.type === 'clases') {
    const { fechaInicio, fechaFin } = req.query;
    if (typeof fechaInicio !== 'string' || typeof fechaFin !== 'string') {
      return res.status(400).json({ error: 'Fechas de inicio y fin son requeridas' });
    }
    const clases = await prisma.clase.findMany({
      where: {
        fecha: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin),
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
}

async function handleDeleteRequest(req: NextApiRequest, res: NextApiResponse) {
  const { type, id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'ID no válido' });
  }

  if (type === 'alumno-suelto') {
    await prisma.alumnoSuelto.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(200).json({ message: 'Alumno suelto eliminado con éxito' });
  } else if (type === 'clase') {
    try {
      await prisma.$transaction([
        prisma.asistencia.deleteMany({ where: { claseId: parseInt(id, 10) } }),
        prisma.alumnoSuelto.deleteMany({ where: { clases: { some: { id: parseInt(id, 10) } } } }),
        prisma.clase.delete({ where: { id: parseInt(id, 10) } }),
      ]);
      res.status(200).json({ message: 'Clase y registros asociados eliminados con éxito' });
    } catch (error) {
      console.error('Error al eliminar la clase:', error);
      res.status(500).json({ error: 'Error al eliminar la clase y sus registros asociados' });
    }
  } else {
    res.status(400).json({ error: 'Tipo de eliminación no válido' });
  }
}