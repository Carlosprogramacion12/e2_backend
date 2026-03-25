import prisma from '../../utils/prisma';
import { RankingService } from './ranking.service';

const rankingService = new RankingService();

export class ResultadosService {
  async getResultados(eventoIdQuery?: number) {
    let evento;

    if (eventoIdQuery) {
      evento = await prisma.eventos.findUnique({ where: { id: BigInt(eventoIdQuery) } });
    } else {
      evento = await prisma.eventos.findFirst({
        orderBy: { created_at: 'desc' }
      });
    }

    const rawEventos = await prisma.eventos.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    const eventos = rawEventos.map(e => ({
      ...e,
      id: Number(e.id)
    }));

    let ranking: any[] = [];
    let formattedEvento = null;

    if (evento) {
      ranking = await rankingService.calcularRanking(Number(evento.id));
      formattedEvento = {
        ...evento,
        id: Number(evento.id)
      };
    }

    return {
      success: true,
      data: {
        ranking,
        eventos,
        evento: formattedEvento
      }
    };
  }

  async getDownloadMetadata(proyectoId: number, posicion: number) {
    const proyecto = await prisma.proyectos.findUnique({
      where: { id: BigInt(proyectoId) },
      include: {
        equipos: {
          include: {
            equipo_participante: {
              include: {
                participantes: {
                  include: { users: true }
                }
              }
            }
          }
        },
        eventos: true
      }
    });

    if (!proyecto) throw { status: 404, message: 'Proyecto no encontrado' };

    const textoLogro = rankingService.getTextoLogro(posicion);

    // Format for PDF generation compatibility in phase 6
    const formatData = {
      proyecto: {
        ...proyecto,
        id: Number(proyecto.id),
        evento_id: Number(proyecto.evento_id),
        equipo_id: Number(proyecto.equipo_id)
      },
      textoLogro,
      nombreTitular: proyecto.equipos ? proyecto.equipos.nombre : 'Sin equipo',
      mostrarIntegrantes: true,
      evento: proyecto.eventos ? {
        ...proyecto.eventos,
        id: Number(proyecto.eventos.id)
      } : null
    };

    return formatData;
  }
}
