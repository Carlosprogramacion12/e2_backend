import PDFDocument from 'pdfkit';
import { Response } from 'express';

export interface ConstanciaPayload {
  proyecto: any;
  textoLogro: string;
  nombreTitular: string;
  mostrarIntegrantes: boolean;
  evento: any;
}

export class PdfService {
  static generarConstancia(res: Response, payload: ConstanciaPayload) {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 40, bottom: 40, left: 60, right: 60 }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Constancia_${payload.nombreTitular.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
    doc.pipe(res);

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
    doc.fontSize(14).fillColor('#666').font('Helvetica').text('SISTEMA DE GESTIÓN DE PROYECTOS ACADÉMICOS', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(32).fillColor('#1a237e').font('Helvetica-Bold').text('CONSTANCIA', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(16).fillColor('#e65100').font('Helvetica-Bold').text(payload.textoLogro, { align: 'center' });

    // ─── Línea divisora ───
    doc.moveDown(1);
    const lineY = doc.y;
    doc.moveTo(120, lineY).lineTo(doc.page.width - 120, lineY).lineWidth(2).strokeColor('#1a237e').stroke();

    // ─── Cuerpo ─── 
    doc.moveDown(1.5);
    doc.fontSize(13).fillColor('#333').font('Helvetica').text('Se otorga la presente constancia a:', { align: 'center' });
    doc.moveDown(0.8);
    doc.fontSize(22).fillColor('#1a237e').font('Helvetica-Bold').text(payload.nombreTitular, { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(12).fillColor('#333').font('Helvetica').text(`Por su destacada participación en el evento "${payload.evento.nombre}"`, { align: 'center' });
    doc.moveDown(0.3);
    doc.text(`con el proyecto "${payload.proyecto.nombre}"`, { align: 'center' });

    // ─── Integrantes ───
    if (payload.mostrarIntegrantes && payload.proyecto.equipo && payload.proyecto.equipo.miembros) {
      doc.moveDown(1);
      doc.fontSize(11).fillColor('#555').font('Helvetica-Bold').text('Integrantes del equipo:', { align: 'center' });
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(10).fillColor('#444');
      payload.proyecto.equipo.miembros.forEach((m: any) => {
        const nombre = m.user ? m.user.name : `Miembro #${m.id}`;
        doc.text(`• ${nombre}`, { align: 'center' });
      });
    }

    // ─── Fecha ───
    doc.moveDown(2);
    const fecha = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.fontSize(10).fillColor('#777').font('Helvetica').text(`Fecha de expedición: ${fecha}`, { align: 'center' });

    doc.end();
  }

  static generarReporteDashboard(res: Response, data: any) {
    const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margins: { top: 40, bottom: 40, left: 50, right: 50 } });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Reporte_Dashboard_${new Date().toISOString().split('T')[0]}.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).fillColor('#1a237e').font('Helvetica-Bold').text('Reporte del Dashboard', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#666').font('Helvetica').text(`Generado el: ${new Date().toLocaleDateString('es-MX')}`, { align: 'center' });

    // ─── Métricas ───
    doc.moveDown(2);
    doc.fontSize(14).fillColor('#333').font('Helvetica-Bold').text('Métricas Generales');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fillColor('#444');
    doc.text(`• Total de Jueces: ${data.total_jueces || 0}`);
    doc.text(`• Total de Participantes: ${data.total_participantes || 0}`);
    doc.text(`• Total de Equipos: ${data.total_equipos || 0}`);
    doc.text(`• Total de Proyectos: ${data.total_proyectos || 0}`);
    doc.text(`• Proyectos Evaluados: ${data.proyectosEvaluados || 0}`);
    doc.text(`• Proyectos Pendientes: ${data.proyectosPendientes || 0}`);

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
      data.eventos_activos.forEach((evento: any) => {
        const fi = new Date(evento.fecha_inicio).toLocaleDateString('es-MX');
        const ff = new Date(evento.fecha_fin).toLocaleDateString('es-MX');
        doc.text(`• ${evento.nombre} (${fi} - ${ff})`);
      });
    } else {
      doc.text('No hay eventos activos actualmente.');
    }

    doc.end();
  }

  static generarReporteGlobalEventos(res: Response, ranking: any[], evento: any) {
    const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margins: { top: 40, bottom: 40, left: 50, right: 50 } });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Resultados_${evento.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).fillColor('#1a237e').font('Helvetica-Bold').text('Resultados del Evento', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#e65100').font('Helvetica-Bold').text(evento.nombre, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#666').font('Helvetica').text(`Reporte emitido el: ${new Date().toLocaleDateString('es-MX')}`, { align: 'center' });

    doc.moveDown(2);
    
    if (ranking.length === 0) {
      doc.fontSize(12).fillColor('#333').text('No se encontraron proyectos en este evento.', { align: 'center' });
    } else {
      ranking.forEach((r, idx) => {
        doc.fontSize(12).fillColor('#333').font('Helvetica-Bold').text(`${idx + 1}. ${r.proyecto.nombre}`);
        doc.fontSize(10).fillColor('#555').font('Helvetica').text(`Equipo: ${r.proyecto.equipo || 'Sin Equipo'}`);
        doc.text(`Puntaje Final: ${Number(r.puntaje_total).toFixed(2)}`);
        doc.moveDown(1);
      });
    }

    doc.end();
  }

  static generarReporteUsuarios(res: Response, usuarios: any[]) {
    const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Reporte_Usuarios_${new Date().toISOString().split('T')[0]}.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).fillColor('#1a237e').font('Helvetica-Bold').text('Reporte General de Usuarios', { align: 'center' });
    doc.moveDown(1);
    usuarios.forEach((u: any, i: number) => {
      doc.fontSize(12).fillColor('#333').font('Helvetica-Bold').text(`${i+1}. ${u.name}`);
      doc.fontSize(10).font('Helvetica').text(`Email: ${u.email}`);
      doc.text(`Rol: ${u.role || 'Sin rol'}`);
      if (u.carrera) doc.text(`Carrera: ${u.carrera}`);
      doc.moveDown(0.5);
    });
    doc.end();
  }

  static generarReporteEquipos(res: Response, equipos: any[]) {
    const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Reporte_Equipos_${new Date().toISOString().split('T')[0]}.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).fillColor('#1a237e').font('Helvetica-Bold').text('Reporte de Equipos', { align: 'center' });
    doc.moveDown(1);
    equipos.forEach((e: any, i: number) => {
      doc.fontSize(12).fillColor('#333').font('Helvetica-Bold').text(`${i+1}. ${e.nombre}`);
      doc.fontSize(10).font('Helvetica').text(`Proyecto: ${e.proyecto?.nombre || 'N/A'}`);
      doc.text(`Integrantes: ${e.miembros?.length || 0}`);
      doc.moveDown(0.5);
    });
    doc.end();
  }

  static generarReporteEventos(res: Response, eventos: any[]) {
    const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Reporte_Eventos_${new Date().toISOString().split('T')[0]}.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).fillColor('#1a237e').font('Helvetica-Bold').text('Reporte de Eventos', { align: 'center' });
    doc.moveDown(1);
    eventos.forEach((e, i) => {
      doc.fontSize(12).fillColor('#333').font('Helvetica-Bold').text(`${i+1}. ${e.nombre}`);
      doc.fontSize(10).font('Helvetica').text(`Fecha: ${new Date(e.fecha_inicio).toLocaleDateString()} - ${new Date(e.fecha_fin).toLocaleDateString()}`);
      doc.text(`Proyectos: ${e.proyectos?.length || 0}`);
      doc.moveDown(0.5);
    });
    doc.end();
  }

  static generarReporteProyectos(res: Response, proyectos: any[]) {
    const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Reporte_Proyectos_${new Date().toISOString().split('T')[0]}.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).fillColor('#1a237e').font('Helvetica-Bold').text('Reporte de Proyectos', { align: 'center' });
    doc.moveDown(1);
    proyectos.forEach((p, i) => {
      doc.fontSize(12).fillColor('#333').font('Helvetica-Bold').text(`${i+1}. ${p.nombre}`);
      doc.fontSize(10).font('Helvetica').text(`Equipo: ${p.equipo?.nombre || 'N/A'}`);
      doc.text(`Evento: ${p.evento?.nombre || 'N/A'}`);
      doc.moveDown(0.5);
    });
    doc.end();
  }
}
