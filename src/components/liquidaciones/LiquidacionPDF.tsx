// components/Liquidaciones/LiquidacionPDF.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
 page: {
   padding: 30,
   fontFamily: 'Helvetica'
 },
 title: {
   fontSize: 20,
   marginBottom: 20,
   textAlign: 'center',
   fontWeight: 'bold'
 },
 subtitle: {
   fontSize: 16,
   marginBottom: 15,
   color: '#333',
   borderBottom: 1,
   paddingBottom: 5
 },
 section: {
   marginBottom: 20
 },
 infoRow: {
   flexDirection: 'row',
   marginBottom: 5
 },
 label: {
   width: '30%',
   fontWeight: 'bold',
   fontSize: 12
 },
 value: {
   flex: 1,
   fontSize: 12
 },
 table: {
   width: 'auto',
   marginTop: 10,
   marginBottom: 10
 },
 tableHeader: {
   flexDirection: 'row',
   backgroundColor: '#f0f0f0',
   borderBottomWidth: 1,
   borderBottomColor: '#000',
   borderBottomStyle: 'solid',
   padding: 8
 },
 tableRow: {
   flexDirection: 'row',
   borderBottomWidth: 1,
   borderBottomColor: '#ccc',
   borderBottomStyle: 'solid',
   padding: 8,
   minHeight: 24
 },
 tableCol: {
   fontSize: 10
 },
 tableColHeader: {
   fontSize: 10,
   fontWeight: 'bold'
 },
 // Columnas con anchos específicos
 colNumero: { width: '10%' },
 colFecha: { width: '12%' },
 colAlumno: { width: '25%' },
 colConcepto: { width: '15%' },
 colTipoPago: { width: '13%' },
 colMonto: { width: '12%' },
 colLiquidacion: { width: '13%' },
 summary: {
   marginTop: 20,
   padding: 10,
   backgroundColor: '#f0f0f0'
 },
 summaryRow: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginBottom: 5,
   fontSize: 12
 },
 total: {
   marginTop: 10,
   paddingTop: 10,
   borderTopWidth: 1,
   borderTopColor: '#000',
   borderTopStyle: 'solid',
   fontSize: 14,
   fontWeight: 'bold'
 },
 footer: {
   position: 'absolute',
   bottom: 30,
   left: 30,
   right: 30
 },
 pageNumber: {
   position: 'absolute',
   bottom: 30,
   right: 30,
   fontSize: 10
 }
});

interface LiquidacionPDFProps {
  liquidacionData: {
    periodo: string;
    regularCount: number;
    sueltasCount: number;
    totalRegular: number;
    totalSueltas: number;
    montoLiquidacionRegular: number;
    montoLiquidacionSueltas: number;
    recibos: any[];
  };
  profesor: { 
    nombre: string; 
    apellido: string; 
    porcentajePorDefecto: number;
    porcentajeClasesSueltasPorDefecto: number;
  } | null | undefined;  // Actualizado para aceptar null | undefined
  porcentajesPersonalizados: {
    porcentajeCursos: number;
    porcentajeClasesSueltas: number;
  };
}

const LiquidacionPDF: React.FC<LiquidacionPDFProps> = ({ 
 liquidacionData, 
 profesor,
 porcentajesPersonalizados
}) => (
 <Document>
   <Page size="A4" style={styles.page}>
     <Text style={styles.title}>Liquidación de Profesores</Text>

    {/* Información General */}
    <View style={styles.section}>
        <Text style={styles.subtitle}>Información General</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Período:</Text>
          <Text style={styles.value}>
            {new Date(liquidacionData.periodo).toLocaleDateString('es-AR', {
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </View>
        {profesor && (  // Verificar si existe profesor
          <View style={styles.infoRow}>
            <Text style={styles.label}>Profesor:</Text>
            <Text style={styles.value}>{profesor.apellido}, {profesor.nombre}</Text>
          </View>
        )}
       <View style={styles.infoRow}>
         <Text style={styles.label}>Fecha de Emisión:</Text>
         <Text style={styles.value}>
           {new Date().toLocaleDateString('es-AR')}
         </Text>
       </View>
     </View>

     {/* Resumen de Liquidación */}
     <View style={styles.section}>
       <Text style={styles.subtitle}>Resumen de Liquidación</Text>
       
       {/* Cursos Regulares */}
       <View style={styles.infoRow}>
         <Text style={styles.label}>Cursos Regulares:</Text>
         <Text style={styles.value}>
           {liquidacionData.regularCount} alumnos - Total: ${liquidacionData.totalRegular.toFixed(2)}
         </Text>
       </View>
       <View style={styles.infoRow}>
         <Text style={styles.label}>Porcentaje:</Text>
         <Text style={styles.value}>
           {porcentajesPersonalizados?.porcentajeCursos || 
             (profesor?.porcentajePorDefecto || 60)}%
         </Text>
       </View>
       <View style={styles.infoRow}>
         <Text style={styles.label}>A liquidar:</Text>
         <Text style={styles.value}>
           ${liquidacionData.montoLiquidacionRegular.toFixed(2)}
         </Text>
       </View>

       {/* Clases Sueltas */}
       <View style={{...styles.infoRow, marginTop: 10}}>
         <Text style={styles.label}>Clases Sueltas:</Text>
         <Text style={styles.value}>
           {liquidacionData.sueltasCount} alumnos - Total: ${liquidacionData.totalSueltas.toFixed(2)}
         </Text>
       </View>
       <View style={styles.infoRow}>
         <Text style={styles.label}>Porcentaje:</Text>
         <Text style={styles.value}>
           {porcentajesPersonalizados?.porcentajeClasesSueltas || 
             (profesor?.porcentajeClasesSueltasPorDefecto || 80)}%
         </Text>
       </View>
       <View style={styles.infoRow}>
         <Text style={styles.label}>A liquidar:</Text>
         <Text style={styles.value}>
           ${liquidacionData.montoLiquidacionSueltas.toFixed(2)}
         </Text>
       </View>
     </View>

     {/* Detalle de Recibos */}
     <Text style={styles.subtitle}>Detalle de Recibos</Text>
     <View style={styles.table}>
       <View style={styles.tableHeader}>
         <Text style={{...styles.tableColHeader, ...styles.colNumero}}>N° Recibo</Text>
         <Text style={{...styles.tableColHeader, ...styles.colFecha}}>Fecha</Text>
         <Text style={{...styles.tableColHeader, ...styles.colAlumno}}>Alumno</Text>
         <Text style={{...styles.tableColHeader, ...styles.colConcepto}}>Concepto</Text>
         <Text style={{...styles.tableColHeader, ...styles.colTipoPago}}>Tipo Pago</Text>
         <Text style={{...styles.tableColHeader, ...styles.colMonto}}>Monto</Text>
         <Text style={{...styles.tableColHeader, ...styles.colLiquidacion}}>A Liquidar</Text>
       </View>
       
       {liquidacionData.recibos.map((recibo, index) => (
         <View key={index} style={styles.tableRow}>
           <Text style={{...styles.tableCol, ...styles.colNumero}}>{recibo.numeroRecibo}</Text>
           <Text style={{...styles.tableCol, ...styles.colFecha}}>
             {new Date(recibo.fecha).toLocaleDateString('es-AR')}
           </Text>
           <Text style={{...styles.tableCol, ...styles.colAlumno}}>
             {recibo.alumno ? 
               `${recibo.alumno.apellido}, ${recibo.alumno.nombre}` : 
               'Sin alumno'}
           </Text>
           <Text style={{...styles.tableCol, ...styles.colConcepto}}>{recibo.concepto.nombre}</Text>
           <Text style={{...styles.tableCol, ...styles.colTipoPago}}>{recibo.tipoPago}</Text>
           <Text style={{...styles.tableCol, ...styles.colMonto}}>
             ${recibo.monto.toFixed(2)}
           </Text>
           <Text style={{...styles.tableCol, ...styles.colLiquidacion}}>
             ${(recibo.montoLiquidacion || 0).toFixed(2)}
           </Text>
         </View>
       ))}
     </View>

     {/* Total Final */}
     <View style={styles.total}>
       <Text>Total a Liquidar: $
         {(liquidacionData.montoLiquidacionRegular + 
           liquidacionData.montoLiquidacionSueltas).toFixed(2)}
       </Text>
     </View>

     {/* Footer */}
     <View style={styles.footer} fixed>
       <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
         <View style={{flex: 1}}>
           <Text>_________________________</Text>
           <Text>Firma del Profesor</Text>
         </View>
         <View style={{flex: 1, alignItems: 'center'}}>
           <Text>_________________________</Text>
           <Text>Firma Administración</Text>
         </View>
       </View>
     </View>

     <Text 
       style={styles.pageNumber} 
       render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} 
       fixed 
     />
   </Page>
 </Document>
);

export default LiquidacionPDF;