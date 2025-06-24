// scripts/fix-missing-columns.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMissingColumns() {
  try {
    console.log('🔧 Iniciando corrección de columnas faltantes...\n');
    
    // Verificar conexión
    console.log('📡 Verificando conexión a la base de datos...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexión establecida\n');

    // 1. Crear enum TipoLiquidacion si no existe
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

    // 2. Agregar columnas faltantes a Profesor
    console.log('🔧 2. Agregando campos faltantes a tabla Profesor...');
    
    // Verificar y agregar montoFijoRegular
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Profesor" 
        ADD COLUMN IF NOT EXISTS "montoFijoRegular" DOUBLE PRECISION DEFAULT 0
      `;
      console.log('   ✅ Columna montoFijoRegular agregada');
    } catch (error) {
      console.log('   ℹ️  Columna montoFijoRegular ya existe');
    }

    // Verificar y agregar montoFijoSueltas
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Profesor" 
        ADD COLUMN IF NOT EXISTS "montoFijoSueltas" DOUBLE PRECISION DEFAULT 0
      `;
      console.log('   ✅ Columna montoFijoSueltas agregada');
    } catch (error) {
      console.log('   ℹ️  Columna montoFijoSueltas ya existe');
    }

    // Verificar y agregar tipoLiquidacionRegular
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Profesor" 
        ADD COLUMN IF NOT EXISTS "tipoLiquidacionRegular" "TipoLiquidacion" DEFAULT 'PORCENTAJE'
      `;
      console.log('   ✅ Columna tipoLiquidacionRegular agregada');
    } catch (error) {
      console.log('   ℹ️  Columna tipoLiquidacionRegular ya existe');
    }

    // Verificar y agregar tipoLiquidacionSueltas
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Profesor" 
        ADD COLUMN IF NOT EXISTS "tipoLiquidacionSueltas" "TipoLiquidacion" DEFAULT 'PORCENTAJE'
      `;
      console.log('   ✅ Columna tipoLiquidacionSueltas agregada');
    } catch (error) {
      console.log('   ℹ️  Columna tipoLiquidacionSueltas ya existe');
    }

    // 3. Agregar campos faltantes a Liquidacion
    console.log('🔧 3. Agregando campos faltantes a tabla Liquidacion...');
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Liquidacion" 
        ADD COLUMN IF NOT EXISTS "tipoLiquidacionRegular" "TipoLiquidacion" DEFAULT 'PORCENTAJE',
        ADD COLUMN IF NOT EXISTS "tipoLiquidacionSueltas" "TipoLiquidacion" DEFAULT 'PORCENTAJE',
        ADD COLUMN IF NOT EXISTS "montoFijoRegular" DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS "montoFijoSueltas" DOUBLE PRECISION
      `;
      console.log('   ✅ Columnas de Liquidacion agregadas');
    } catch (error) {
      console.log('   ℹ️  Algunas columnas de Liquidacion ya existen');
    }

    // 4. Verificar y actualizar campos timestamp en Liquidacion
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Liquidacion" 
        ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
        ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP
      `;
      console.log('   ✅ Defaults de timestamp actualizados');
    } catch (error) {
      console.log('   ℹ️  Defaults de timestamp ya configurados');
    }

    // 5. Inicializar valores por defecto
    console.log('🔧 4. Inicializando valores por defecto...');
    
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

    console.log(`   ✅ ${updateResult} registros de profesores actualizados`);

    // 6. Actualizar liquidaciones existentes
    await prisma.$executeRaw`
      UPDATE "Liquidacion" 
      SET 
        "tipoLiquidacionRegular" = COALESCE("tipoLiquidacionRegular", 'PORCENTAJE'),
        "tipoLiquidacionSueltas" = COALESCE("tipoLiquidacionSueltas", 'PORCENTAJE'),
        "createdAt" = COALESCE("createdAt", "fecha", CURRENT_TIMESTAMP),
        "updatedAt" = COALESCE("updatedAt", "fecha", CURRENT_TIMESTAMP)
      WHERE 
        "tipoLiquidacionRegular" IS NULL OR
        "tipoLiquidacionSueltas" IS NULL OR
        "createdAt" IS NULL OR
        "updatedAt" IS NULL
    `;

    console.log('   ✅ Liquidaciones existentes actualizadas');

    // 7. Crear índices si no existen
    console.log('🔧 5. Creando índices...');
    try {
      await prisma.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS "Liquidacion_mes_anio_idx" 
        ON "Liquidacion"("mes", "anio")
      `;
      await prisma.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS "Liquidacion_profesorId_idx" 
        ON "Liquidacion"("profesorId")
      `;
      console.log('   ✅ Índices creados');
    } catch (error) {
      console.log('   ℹ️  Índices ya existen');
    }

    // 8. Verificación final
    console.log('\n🔍 Verificación final...');
    const sampleProfesor = await prisma.profesor.findFirst({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        tipoLiquidacionRegular: true,
        tipoLiquidacionSueltas: true,
        montoFijoRegular: true,
        montoFijoSueltas: true
      }
    });
    console.log('✅ Muestra profesor:', sampleProfesor);

    // 9. Contar registros para verificar integridad
    const counts = {
      profesores: await prisma.profesor.count(),
      liquidaciones: await prisma.liquidacion.count(),
      recibos: await prisma.recibo.count(),
      alumnos: await prisma.alumno.count()
    };
    
    console.log('\n📊 Estado final de la base de datos:');
    console.log(`   Profesores: ${counts.profesores}`);
    console.log(`   Liquidaciones: ${counts.liquidaciones}`);
    console.log(`   Recibos: ${counts.recibos}`);
    console.log(`   Alumnos: ${counts.alumnos}`);

    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. npx prisma generate (para regenerar el cliente)');
    console.log('2. Reiniciar el servidor de desarrollo');

  } catch (error) {
    console.error('\n❌ Error en migración:', error);
    console.error('\n🔄 Puedes intentar:');
    console.error('- Verificar la conexión a la base de datos');
    console.error('- Ejecutar las migraciones de Prisma: npx prisma migrate deploy');
    console.error('- Contactar al administrador de la base de datos');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la migración
if (require.main === module) {
  fixMissingColumns()
    .then(() => {
      console.log('\n✅ Script ejecutado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error ejecutando script:', error);
      process.exit(1);
    });
}

module.exports = { fixMissingColumns };