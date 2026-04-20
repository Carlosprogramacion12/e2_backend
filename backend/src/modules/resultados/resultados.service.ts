import prisma from '../../utils/prisma';
import { RankingService } from './ranking.service';

const rankingService = new RankingService();

export class ResultadosService {
  async getResultados(userId?: number, eventoIdQuery?: number) {
    let evento;

    if (eventoIdQuery) {
      evento = await prisma.eventos.findUnique({ where: { id: BigInt(eventoIdQuery) } });
    } else if (userId) {
      // Intentar encontrar el evento del usuario primero si es participante
      const proyecto = await prisma.proyectos.findFirst({
        where: {
          equipos: {
            equipo_miembros: {
              some: { user_id: BigInt(userId) }
            }
          }
        },
        include: { eventos: true }
      });

      if (proyecto && proyecto.eventos) {
        evento = proyecto.eventos;
      }
    }

    if (!evento) {
      // Si no tiene evento o no se especificó, tomar el más reciente global
      evento = await prisma.eventos.findFirst({
        orderBy: { created_at: 'desc' }
      });
    }

    let rawEventos;
    if (userId) {
      rawEventos = await prisma.eventos.findMany({
        where: {
          proyectos: {
            some: {
              equipos: {
                equipo_miembros: {
                  some: { user_id: BigInt(userId) }
                }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      // Si el usuario es administrador o no tiene participaciones,
      // no debemos dejar la lista vacía para él.
      if (rawEventos.length === 0) {
        rawEventos = await prisma.eventos.findMany({
          orderBy: { created_at: 'desc' }
        });
      }
    } else {
      rawEventos = await prisma.eventos.findMany({
        orderBy: { created_at: 'desc' }
      });
    }
    
    const eventos = rawEventos.map(e => ({
      ...e,
      id: Number(e.id)
    }));

    let ranking: any[] = [];
    let formattedEvento = null;
    let isEnrolled = false;
    let isFinished = false;

    if (evento) {
      isFinished = new Date() > new Date(evento.fecha_fin);
      ranking = await rankingService.calcularRanking(Number(evento.id));
      formattedEvento = {
        ...evento,
        id: Number(evento.id)
      };

      if (userId) {
        const enrollment = await prisma.proyectos.findFirst({
          where: {
            evento_id: BigInt(evento.id),
            equipos: {
              equipo_miembros: {
                some: { user_id: BigInt(userId) }
              }
            }
          }
        });
        isEnrolled = !!enrollment;
      }
    }

    return {
      success: true,
      data: {
        ranking,
        eventos,
        evento: formattedEvento,
        isEnrolled,
        isFinished,
        serverTime: new Date().toISOString()
      }
    };
  }

  async getDownloadMetadata(proyectoId: number, posicion: number) {
    const proyecto = await prisma.proyectos.findUnique({
      where: { id: BigInt(proyectoId) },
      include: {
        equipos: {
          include: {
            equipo_miembros: {
              include: { users: true }
            }
          }
        },
        eventos: true
      }
    });

    if (!proyecto) throw { status: 404, message: 'Proyecto no encontrado' };

    const textoLogro = rankingService.getTextoLogro(posicion);

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

