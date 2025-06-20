import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  
  // Header styles
  header: {
    marginBottom: 25,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 15,
  },
  
  // Section styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
  },
  
  // Information grid
  infoGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  infoItem: {
    width: '50%',
    marginBottom: 8,
    paddingRight: 10,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#4b5563',
    fontSize: 9,
  },
  infoValue: {
    color: '#1f2937',
    fontSize: 10,
    marginTop: 2,
  },
  
  // Summary cards
  summaryContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 20,
    gap: 15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  summaryCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  summaryRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    fontSize: 9,
  },
  summaryLabel: {
    color: '#6b7280',
    maxWidth: '60%',
  },
  summaryValue: {
    color: '#1f2937',
    fontWeight: 'bold',
    textAlign: 'right',
    maxWidth: '40%',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    borderTopStyle: 'solid',
    paddingTop: 6,
    marginTop: 6,
  },
  
  // Table styles
  table: {
    marginTop: 15,
    marginBottom: 15,
  },
  tableHeader: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 2,
    borderBottomColor: '#374151',
    borderBottomStyle: 'solid',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    paddingVertical: 6,
    paddingHorizontal: 5,
    minHeight: 24,
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  
  // Table columns with specific widths
  colRecibo: { width: '12%', fontSize: 8 },
  colFecha: { width: '12%', fontSize: 8 },
  colAlumno: { width: '30%', fontSize: 8 },
  colConcepto: { width: '20%', fontSize: 8 },
  colMonto: { width: '13%', fontSize: 8, textAlign: 'right' },
  colLiquidacion: { width: '13%', fontSize: 8, textAlign: 'right' },
  
  // Table header columns
  colHeaderRecibo: { width: '12%', fontSize: 9, fontWeight: 'bold' },
  colHeaderFecha: { width: '12%', fontSize: 9, fontWeight: 'bold' },
  colHeaderAlumno: { width: '30%', fontSize: 9, fontWeight: 'bold' },
  colHeaderConcepto: { width: '20%', fontSize: 9, fontWeight: 'bold' },
  colHeaderMonto: { width: '13%', fontSize: 9, fontWeight: 'bold', textAlign: 'right' },
  colHeaderLiquidacion: { width: '13%', fontSize: 9, fontWeight: 'bold', textAlign: 'right' },
  
  // Total section
  totalSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ecfdf5',
    border: '2px solid #10b981',
    borderRadius: 8,
  },
  totalRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#065f46',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065f46',
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 30,
    right: 30,
    marginTop: 30,
  },
  signatureContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signatureBox: {
    width: '45%',
    textAlign: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    borderTopStyle: 'solid',
    paddingTop: 8,
    fontSize: 9,
    color: '#6b7280',
  },
  
  // Page number
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    fontSize: 8,
    color: '#9ca3af',
  },
  
  // Text utilities
  textBold: { fontWeight: 'bold' },
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  
  // Configuration display
  configRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    fontSize: 9,
    paddingVertical: 2,
  },
  configLabel: {
    color: '#6b7280',
    fontWeight: 'bold',
  },
  configValue: {
    color: '#1f2937',
  },
  
  // Additional spacing utilities
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
});

interface LiquidacionPDFProps {
  liquidacionData: {
    periodo: string;
    regularCount: number;
    sueltasCount: number;
    clasesCount: number;
    totalRegular: number;
    totalSueltas: number;
    montoLiquidacionRegular: number;
    montoLiquidacionSueltas: number;
    recibos: any[];
    configuracion?: {
      tipoRegular: 'PORCENTAJE' | 'MONTO_FIJO';
      tipoSueltas: 'PORCENTAJE' | 'MONTO_FIJO';
      valorRegular: number;
      valorSueltas: number;
    };
  };
  profesor: { 
    nombre: string; 
    apellido: string; 
    porcentajePorDefecto?: number;
    porcentajeClasesSueltasPorDefecto?: number;
  } | null | undefined;
}

const LiquidacionPDF: React.FC<LiquidacionPDFProps> = ({ 
  liquidacionData, 
  profesor
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const formatPeriod = (periodo: string) => {
    const [year, month] = periodo.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getConfigurationText = (tipo: 'PORCENTAJE' | 'MONTO_FIJO', valor: number) => {
    return tipo === 'MONTO_FIJO' 
      ? formatCurrency(valor)
      : `${valor}%`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Liquidación de Profesor</Text>
          <Text style={styles.subtitle}>MB Estudio de Danzas</Text>
        </View>

        {/* Información General */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información General</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Período:</Text>
              <Text style={styles.infoValue}>{formatPeriod(liquidacionData.periodo)}</Text>
            </View>
            
            {profesor && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Profesor:</Text>
                <Text style={styles.infoValue}>{profesor.apellido}, {profesor.nombre}</Text>
              </View>
            )}
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha de Emisión:</Text>
              <Text style={styles.infoValue}>{formatDate(new Date().toISOString())}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total a Liquidar:</Text>
              <Text style={[styles.infoValue, styles.textBold]}>
                {formatCurrency(liquidacionData.montoLiquidacionRegular + liquidacionData.montoLiquidacionSueltas)}
              </Text>
            </View>
          </View>
        </View>

        {/* Configuración de Liquidación */}
        {liquidacionData.configuracion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuración de Liquidación</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Clases Regulares:</Text>
                <Text style={styles.infoValue}>
                  {getConfigurationText(
                    liquidacionData.configuracion.tipoRegular, 
                    liquidacionData.configuracion.valorRegular
                  )}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Clases Sueltas:</Text>
                <Text style={styles.infoValue}>
                  {getConfigurationText(
                    liquidacionData.configuracion.tipoSueltas, 
                    liquidacionData.configuracion.valorSueltas
                  )}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Resumen de Liquidación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de Liquidación</Text>
          
          <View style={styles.summaryContainer}>
            {/* Cursos Regulares */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardTitle}>Clases Regulares</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Recibos:</Text>
                <Text style={styles.summaryValue}>{liquidacionData.regularCount}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Recaudado:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(liquidacionData.totalRegular)}</Text>
              </View>
              
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={[styles.summaryLabel, styles.textBold]}>A Liquidar:</Text>
                <Text style={[styles.summaryValue, styles.textBold]}>
                  {formatCurrency(liquidacionData.montoLiquidacionRegular)}
                </Text>
              </View>
            </View>

            {/* Clases Sueltas */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardTitle}>Clases Sueltas</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Alumnos:</Text>
                <Text style={styles.summaryValue}>{liquidacionData.sueltasCount}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Clases:</Text>
                <Text style={styles.summaryValue}>{liquidacionData.clasesCount}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Recaudado:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(liquidacionData.totalSueltas)}</Text>
              </View>
              
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={[styles.summaryLabel, styles.textBold]}>A Liquidar:</Text>
                <Text style={[styles.summaryValue, styles.textBold]}>
                  {formatCurrency(liquidacionData.montoLiquidacionSueltas)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Detalle de Recibos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle de Recibos</Text>
          
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.colHeaderRecibo}>N° Recibo</Text>
              <Text style={styles.colHeaderFecha}>Fecha</Text>
              <Text style={styles.colHeaderAlumno}>Alumno</Text>
              <Text style={styles.colHeaderConcepto}>Concepto</Text>
              <Text style={styles.colHeaderMonto}>Monto</Text>
              <Text style={styles.colHeaderLiquidacion}>A Liquidar</Text>
            </View>
            
            {/* Rows */}
            {liquidacionData.recibos.map((recibo, index) => (
              <View 
                key={index} 
                style={[
                  styles.tableRow, 
                  index % 2 === 1 ? styles.tableRowAlt : {}
                ]}
              >
                <Text style={styles.colRecibo}>{recibo.numeroRecibo}</Text>
                <Text style={styles.colFecha}>{formatDate(recibo.fecha)}</Text>
                <Text style={styles.colAlumno}>
                  {recibo.alumno 
                    ? `${recibo.alumno.apellido}, ${recibo.alumno.nombre}` 
                    : 'Sin alumno'}
                </Text>
                <Text style={styles.colConcepto}>
                  {recibo.concepto?.nombre || 'Sin concepto'}
                </Text>
                <Text style={styles.colMonto}>{formatCurrency(recibo.monto)}</Text>
                <Text style={styles.colLiquidacion}>
                  {formatCurrency(recibo.montoLiquidacion || 0)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Total Final */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL A LIQUIDAR:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(
                liquidacionData.montoLiquidacionRegular + liquidacionData.montoLiquidacionSueltas
              )}
            </Text>
          </View>
        </View>

        {/* Footer con firmas */}
        <View style={styles.footer} fixed>
          <View style={styles.signatureContainer}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine}>
                <Text>Firma del Profesor</Text>
              </View>
            </View>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine}>
                <Text>Firma Administración</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Page number */}
        <Text 
          style={styles.pageNumber} 
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} 
          fixed 
        />
      </Page>
    </Document>
  );
};

export default LiquidacionPDF;