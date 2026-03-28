import prisma from '../../utils/prisma';
import { StoreEvaluacionDto } from './juez.types';

export class JuezRepository {
  async getDashboardData(userId: number) {
    // 1. Obtener eventos asignados al juez via evento_jueces
    const eventosAsignados = await prisma.eventos.findMany({
      where: {
        evento_jueces: {
          some: { user_id: BigInt(userId) }
        }
      }
    });

    // 2. Por cada evento, traer proyectos y si el juez ya evaluó
    const eventosConProyectos = await Promise.all(
      eventosAsignados.map(async (evento) => {
        const proyectos = await prisma.proyectos.findMany({
          where: { evento_id: evento.id },
          include: {
            equipos: true,
            evaluaciones: {
              where: { juez_id: BigInt(userId) }
            }
          }
        });

        return {
          id: Number(evento.id),
          nombre: evento.nombre,
          descripcion: evento.descripcion,
          fecha_inicio: evento.fecha_inicio,
          fecha_fin: evento.fecha_fin,
          proyectos: proyectos.map((p) => ({
            id: Number(p.id),
            nombre: p.nombre,
            equipo: p.equipos?.nombre || 'Sin equipo',
            evaluado: p.evaluaciones.length > 0
          }))
        };
      })
    );

    return eventosConProyectos;
  }

  async getEvento(eventoId: number, juezId: number) {
    const evento = await prisma.eventos.findUnique({
      where: { id: BigInt(eventoId) },
      include: {
        evaluacion_criterios: true,
        proyectos: {
          include: {
            equipos: true,
            evaluaciones: {
              where: { juez_id: BigInt(juezId) }
            }
          }
        }
      }
    });
    return evento;
  }

  async getEvaluacionData(proyectoId: number, juezId: number) {
    const proyecto = await prisma.proyectos.findUnique({
      where: { id: BigInt(proyectoId) },
      include: {
        eventos: {
          include: { evaluacion_criterios: true }
        },
        equipos: true,
        evaluaciones: {
          where: { juez_id: BigInt(juezId) }
        }
      }
    });

    if (!proyecto) return null;

    // Verify juez is assigned to this event
    const asignado = await prisma.evento_jueces.findUnique({
      where: {
        evento_id_user_id: {
          evento_id: proyecto.evento_id,
          user_id: BigInt(juezId)
        }
      }
    });

    if (!asignado) throw { status: 403, message: 'No tienes permiso para evaluar este proyecto.' };

    const comentarioEval = proyecto.evaluaciones.find((e: any) => e.comentario);

    const calificacionesPrevias: Record<string, number> = {};
    proyecto.evaluaciones.forEach((c: any) => {
      calificacionesPrevias[c.criterio_id.toString()] = Number(c.puntuacion);
    });

    return {
      proyecto: {
        ...proyecto,
        id: Number(proyecto.id),
        evento_id: Number(proyecto.evento_id),
        equipo_id: Number(proyecto.equipo_id),
        evento: proyecto.eventos ? {
          ...proyecto.eventos,
          id: Number(proyecto.eventos.id),
          criterios: proyecto.eventos.evaluacion_criterios.map((c: any) => ({
            ...c,
            id: Number(c.id),
            evento_id: Number(c.evento_id)
          }))
        } : null,
        equipo: proyecto.equipos ? {
          ...proyecto.equipos,
          id: Number(proyecto.equipos.id)
        } : null
      },
      calificacionesPrevias,
      comentarioPrevio: comentarioEval?.comentario || ''
    };
  }

  async storeEvaluacion(proyectoId: number, juezId: number, dto: StoreEvaluacionDto) {
    const proyecto = await prisma.proyectos.findUnique({ where: { id: BigInt(proyectoId) }});
    if (!proyecto) throw { status: 404, message: 'Proyecto no encontrado' };

    const ops: any[] = [];

    for (const [criterioIdStr, puntuacion] of Object.entries(dto.puntuaciones)) {
      const criterioId = parseInt(criterioIdStr, 10);
      const existingEval = await prisma.evaluaciones.findFirst({
        where: {
          proyecto_id: BigInt(proyectoId),
          juez_id: BigInt(juezId),
          criterio_id: BigInt(criterioId)
        }
      });

      const comentario = dto.comentario || undefined;

      if (existingEval) {
        ops.push(prisma.evaluaciones.update({
          where: { id: existingEval.id },
          data: { puntuacion: puntuacion as any, comentario }
        }));
      } else {
        ops.push(prisma.evaluaciones.create({
          data: {
            proyecto_id: BigInt(proyectoId),
            juez_id: BigInt(juezId),
            criterio_id: BigInt(criterioId),
            puntuacion: puntuacion as any,
            comentario
          }
        }));
      }
    }

    await prisma.$transaction(ops);
  }
}
