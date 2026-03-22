/**
 * Servicio de generación de PDF con PDFKit
 * Equivalente a barryvdh/laravel-dompdf
 */
const PDFDocument = require('pdfkit');

/**
 * Genera un PDF de constancia y lo envía como stream en la response
 */
function generarConstanciaPDF(res, { proyecto, textoLogro, nombreTitular, mostrarIntegrantes, evento }) {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 40, bottom: 40, left: 60, right: 60 }
  });

  // Headers para streaming
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=Constancia_${nombreTitular}.pdf`);
  doc.pipe(res);

  const pageWidth = doc.page.width - 120;

  // ─── Borde decorativo ───
  doc.rect(30, 20, doc.page.width - 60, doc.page.height - 40)
     .lineWidth(3)
     .strokeColor('#1a237e')
     .stroke();

  doc.rect(40, 30, doc.page.width - 80, doc.page.height - 60)
     .lineWidth(1)
     .strokeColor('#3949ab')
     .stroke();

  // ─── Encabezado ───
  doc.moveDown(2);
  doc.fontSize(14)
     .fillColor('#666')
     .font('Helvetica')
     .text('SISTEMA DE GESTIÓN DE PROYECTOS ACADÉMICOS', { align: 'center' });

  doc.moveDown(0.5);
  doc.fontSize(32)
     .fillColor('#1a237e')
     .font('Helvetica-Bold')
     .text('CONSTANCIA', { align: 'center' });

  doc.moveDown(0.3);
  doc.fontSize(16)
     .fillColor('#e65100')
     .font('Helvetica-Bold')
     .text(textoLogro, { align: 'center' });

  // ─── Línea divisora ───
  doc.moveDown(1);
  const lineY = doc.y;
  doc.moveTo(120, lineY).lineTo(doc.page.width - 120, lineY)
     .lineWidth(2)
     .strokeColor('#1a237e')
     .stroke();

  // ─── Cuerpo ─── 
  doc.moveDown(1.5);
  doc.fontSize(13)
     .fillColor('#333')
     .font('Helvetica')
     .text('Se otorga la presente constancia a:', { align: 'center' });

  doc.moveDown(0.8);
  doc.fontSize(22)
     .fillColor('#1a237e')
     .font('Helvetica-Bold')
     .text(nombreTitular, { align: 'center' });

  doc.moveDown(1);
  doc.fontSize(12)
     .fillColor('#333')
     .font('Helvetica')
     .text(`Por su destacada participación en el evento "${evento.nombre}"`, { align: 'center' });

  doc.moveDown(0.3);
  doc.text(`con el proyecto "${proyecto.nombre}"`, { align: 'center' });

  // ─── Integrantes (si aplica) ───
  if (mostrarIntegrantes && proyecto.equipo && proyecto.equipo.participantes) {
    doc.moveDown(1);
    doc.fontSize(11)
       .fillColor('#555')
       .font('Helvetica-Bold')
       .text('Integrantes del equipo:', { align: 'center' });

    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(10).fillColor('#444');
    proyecto.equipo.participantes.forEach(p => {
      const nombre = p.user ? p.user.name : `Participante #${p.id}`;
      doc.text(`• ${nombre}`, { align: 'center' });
    });
  }

  // ─── Fecha ───
  doc.moveDown(2);
  const fecha = new Date().toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  doc.fontSize(10)
     .fillColor('#777')
     .font('Helvetica')
     .text(`Fecha de expedición: ${fecha}`, { align: 'center' });

  doc.end();
}

/**
 * Genera un reporte PDF del dashboard
 */
function generarReporteDashboard(res, data) {
  const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margins: { top: 40, bottom: 40, left: 50, right: 50 } });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Reporte_Dashboard_${new Date().toISOString().split('T')[0]}.pdf`);
  doc.pipe(res);

  // Título
  doc.fontSize(20).fillColor('#1a237e').font('Helvetica-Bold')
     .text('Reporte del Dashboard', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#666').font('Helvetica')
     .text(`Generado el: ${new Date().toLocaleDateString('es-MX')}`, { align: 'center' });

  // ─── Métricas ───
  doc.moveDown(2);
  doc.fontSize(14).fillColor('#333').font('Helvetica-Bold').text('Métricas Generales');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica').fillColor('#444');
  doc.text(`• Total de Jueces: ${data.total_jueces}`);
  doc.text(`• Total de Participantes: ${data.total_participantes}`);
  doc.text(`• Total de Equipos: ${data.total_equipos}`);
  doc.text(`• Total de Proyectos: ${data.total_proyectos}`);
  doc.text(`• Proyectos Evaluados: ${data.proyectosEvaluados}`);
  doc.text(`• Proyectos Pendientes: ${data.proyectosPendientes}`);

  // ─── Participantes por Carrera ───
  doc.moveDown(1.5);
  doc.fontSize(14).fillColor('#333').font('Helvetica-Bold').text('Participantes por Carrera');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica').fillColor('#444');
  if (data.participantesPorCarrera) {
    Object.entries(data.participantesPorCarrera).forEach(([carrera, total]) => {
      doc.text(`• ${carrera}: ${total} participantes`);
    });
  }

  // ─── Eventos activos ───
  doc.moveDown(1.5);
  doc.fontSize(14).fillColor('#333').font('Helvetica-Bold').text('Eventos Activos');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica').fillColor('#444');
  if (data.eventos_activos && data.eventos_activos.length > 0) {
    data.eventos_activos.forEach(evento => {
      doc.text(`• ${evento.nombre} (${evento.fecha_inicio} - ${evento.fecha_fin})`);
    });
  } else {
    doc.text('No hay eventos activos actualmente.');
  }

  doc.end();
}

module.exports = { generarConstanciaPDF, generarReporteDashboard };
