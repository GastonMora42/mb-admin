import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { CognitoJwtVerifier } from "aws-jwt-verify";

const verifier = CognitoJwtVerifier.create({
  userPoolId: "us-east-1_OpCljWDF7",
  tokenUse: "access",
  clientId: "7tmctt10ht1q3tff359eii7jv0",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
  }

  try {
    const payload = await verifier.verify(token);
    const { profesorId, estiloId, fecha, asistencias, alumnosSueltos } = req.body;

    // Validación de datos de entrada
    if (!profesorId || !estiloId || !fecha || !Array.isArray(asistencias)) {
      return res.status(400).json({ error: 'Datos de entrada inválidos' });
    }

    // Buscar el profesor por su username de Cognito (asumiendo que es el email)
    const profesor = await prisma.profesor.findFirst({
      where: { email: profesorId }
    });

    if (!profesor) {
      return res.status(404).json({ error: 'Profesor no encontrado' });
    }

    const clase = await prisma.$transaction(async (prisma) => {
      const nuevaClase = await prisma.clase.create({
        data: {
          fecha: new Date(fecha),
          profesorId: profesor.id,
          estiloId: parseInt(estiloId),
        },
      });

      // Crear asistencias para alumnos regulares
      await prisma.asistencia.createMany({
        data: asistencias.map((a) => ({
          claseId: nuevaClase.id,
          alumnoId: a.alumnoId,
          asistio: a.asistio,
        })),
      });

      // Crear alumnos sueltos
      for (const alumnoSuelto of alumnosSueltos) {
        await prisma.alumnoSuelto.create({
          data: {
            claseId: nuevaClase.id,
            nombre: alumnoSuelto.nombre,
            apellido: alumnoSuelto.apellido,
            telefono: alumnoSuelto.telefono,
            email: alumnoSuelto.email,
          },
        });
      }

      return nuevaClase;
    });

    res.status(200).json({ message: 'Clase registrada con éxito', clase });
  } catch (error) {
    console.error('Error al registrar la clase:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: `Error al registrar la clase: ${error.message}` });
    } else {
      res.status(500).json({ error: 'Error desconocido al registrar la clase' });
    }
  }
}