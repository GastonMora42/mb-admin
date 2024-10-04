import prisma from '@/lib/prisma'
import { Alumno, Concepto, Recibo } from '../types'

export async function getAlumnos(): Promise<Alumno[]> {
  return prisma.alumno.findMany()
}

export async function createAlumno(data: Omit<Alumno, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alumno> {
  return prisma.alumno.create({ data })
}

export async function getConceptos(): Promise<Concepto[]> {
  return prisma.concepto.findMany()
}

export async function createConcepto(data: Omit<Concepto, 'id' | 'createdAt' | 'updatedAt'>): Promise<Concepto> {
  return prisma.concepto.create({ data })
}

export async function createRecibo(data: Omit<Recibo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recibo> {
  return prisma.recibo.create({ data })
}

