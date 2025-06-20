const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrarEnNeon() {
  try {
    console.log('🚀 Migración específica para Neon Database\n');
    
    // Verificar conexión
    console.log('📡 Verificando conexión a Neon...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexión establecida\n');

    // Backup de conteo de registros
    const counts = {
      profesores: await prisma.profesor.count(),
      liquidaciones: await prisma.liquidacion.count(),
      recibos: await prisma.recibo.count(),
      alumnos: await prisma.alumno.count()
    };
    console.log('📊 Estado actual:', counts);
    console.log('');

    // Ejecutar migración paso a paso
    console.log('🔧 1. Creando enum TipoLiquidacion...');
    await prisma.$executeRaw`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TipoLiquidacion') THEN
              CREATE TYPE "TipoLiquidacion" AS ENUM ('PORCENTAJE', 'MONTO_FIJO');
              RAISE NOTICE 'Enum TipoLiquidacion creado';
          ELSE
              RAISE NOTICE 'Enum TipoLiquidacion ya existe';
          END IF;
      END$$;
    `;

    console.log('🔧 2. Agregando campos a Profesor...');
    await prisma.$executeRaw`
      ALTER TABLE "Profesor" 
        ADD COLUMN IF NOT EXISTS "montoFijoRegular" FLOAT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "montoFijoSueltas" FLOAT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "tipoLiquidacionRegular" "TipoLiquidacion" DEFAULT 'PORCENTAJE',
        ADD COLUMN IF NOT EXISTS "tipoLiquidacionSueltas" "TipoLiquidacion" DEFAULT 'PORCENTAJE'
    `;

    console.log('🔧 3. Agregando campos a Liquidacion...');
    await prisma.$executeRaw`
      ALTER TABLE "Liquidacion" 
        ADD COLUMN IF NOT EXISTS "tipoLiquidacionRegular" "TipoLiquidacion" DEFAULT 'PORCENTAJE',
        ADD COLUMN IF NOT EXISTS "tipoLiquidacionSueltas" "TipoLiquidacion" DEFAULT 'PORCENTAJE',
        ADD COLUMN IF NOT EXISTS "montoFijoRegular" FLOAT,
        ADD COLUMN IF NOT EXISTS "montoFijoSueltas" FLOAT,
        ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    `;

    console.log('🔧 4. Creando índices...');
    await prisma.$executeRaw`CREATE INDEX CONCURRENTLY IF NOT EXISTS "Liquidacion_mes_anio_idx" ON "Liquidacion"("mes", "anio")`;
    await prisma.$executeRaw`CREATE INDEX CONCURRENTLY IF NOT EXISTS "Liquidacion_profesorId_idx" ON "Liquidacion"("profesorId")`;

    console.log('🔧 5. Inicializando valores...');
    const updateResult = await prisma.$executeRaw`
      UPDATE "Profesor" 
      SET 
        "montoFijoRegular" = COALESCE("montoFijoRegular", 0),
        "montoFijoSueltas" = COALESCE("montoFijoSueltas", 0),
        "tipoLiquidacionRegular" = COALESCE("tipoLiquidacionRegular", 'PORCENTAJE'),
        "tipoLiquidacionSueltas" = COALESCE("tipoLiquidacionSueltas", 'PORCENTAJE')
      WHERE 
        "montoFijoRegular" IS NULL OR
        "montoFijoSueltas" IS NULL OR
        "tipoLiquidacionRegular" IS NULL OR
        "tipoLiquidacionSueltas" IS NULL
    `;

    await prisma.$executeRaw`
      UPDATE "Liquidacion" 
      SET 
        "tipoLiquidacionRegular" = COALESCE("tipoLiquidacionRegular", 'PORCENTAJE'),
        "tipoLiquidacionSueltas" = COALESCE("tipoLiquidacionSueltas", 'PORCENTAJE'),
        "createdAt" = COALESCE("createdAt", "fecha", CURRENT_TIMESTAMP),
        "updatedAt" = COALESCE("updatedAt", "fecha", CURRENT_TIMESTAMP)
    `;

    // Verificación final
    console.log('\n🔍 Verificación final...');
    const sample = await prisma.profesor.findFirst({
      select: {
        nombre: true,
        apellido: true,
        tipoLiquidacionRegular: true,
        montoFijoRegular: true
      }
    });
    console.log('✅ Muestra profesor:', sample);

    const newCounts = {
      profesores: await prisma.profesor.count(),
      liquidaciones: await prisma.liquidacion.count()
    };
    
    console.log('\n📊 Verificación de integridad:');
    console.log(`Profesores: ${counts.profesores} → ${newCounts.profesores} ${counts.profesores === newCounts.profesores ? '✅' : '❌'}`);
    console.log(`Liquidaciones: ${counts.liquidaciones} → ${newCounts.liquidaciones} ${counts.liquidaciones === newCounts.liquidaciones ? '✅' : '❌'}`);

    console.log('\n🎉 ¡Migración en Neon completada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Actualiza schema.prisma');
    console.log('2. npx prisma generate');
    console.log('3. npx prisma migrate dev --name add_liquidacion_types');

  } catch (error) {
    console.error('\n❌ Error en migración:', error);
    console.error('\n🔄 En Neon puedes:');
    console.error('- Restaurar desde backup automático');
    console.error('- Usar un branch diferente');
    console.error('- Contactar soporte de Neon si es necesario');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrarEnNeon();