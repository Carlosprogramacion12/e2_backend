import prisma from '../../utils/prisma';
import { PdfService } from '../../utils/pdf.service';
import { Response } from 'express';

export class ReportesService {
  async getGeneralStats() {
    const totalUsuarios = await prisma.users.count();
    const totalEquipos = await prisma.equipos.count();
    const totalEventos = await prisma.eventos.count();
    const totalProyectos = await prisma.proyectos.count();

    return { totalUsuarios, totalEquipos, totalEventos, totalProyectos };
  }

  async generateUsuariosPdf(res: Response) {
    const usuarios = await prisma.users.findMany({
      orderBy: { created_at: 'desc' }
    });
    PdfService.generarReporteUsuarios(res, usuarios);
  }

  async generateEquiposPdf(res: Response) {
    const equipos = await prisma.equipos.findMany({
      include: { 
        miembros: { include: { user: true } },
        proyectos: { include: { evento: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    const data = equipos.map(e => ({
      ...e,
      proyecto: e.proyectos[0] || null
    }));
    PdfService.generarReporteEquipos(res, data);
  }

  async generateEventosPdf(res: Response) {
    const eventos = await prisma.eventos.findMany({
      include: { proyectos: true, criterios: true },
      orderBy: { created_at: 'desc' }
    });
    PdfService.generarReporteEventos(res, eventos);
  }

  async generateProyectosPdf(res: Response) {
    const proyectos = await prisma.proyectos.findMany({
      include: { 
        equipo: { include: { miembros: { include: { user: true } } } },
        evento: true
      },
      orderBy: { created_at: 'desc' }
    });
    const data = proyectos.map(p => ({
        ...p,
        equipo: p.equipo,
        evento: p.evento
    }));
    PdfService.generarReporteProyectos(res, data);
  }
}

export const reportesService = new ReportesService();

