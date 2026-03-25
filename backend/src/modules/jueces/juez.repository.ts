import prisma from '../../utils/prisma';
import { StoreEvaluacionDto } from './juez.types';

export class JuezRepository {
  async getDashboardData(userId: number) {
    // 1. Obtener eventos asignados al juez
    const eventosAsignados = await prisma.eventos.findMany({
      where: {
        evento_user: {
          some: { user_id: BigInt(userId) }
        }
      }
    });

    // 2. Por cada evento, traer los proyectos, sus equipos y si el juez ya lo calificó
    const eventosConProyectos = await Promise.all(
      eventosAsignados.map(async (evento) => {
        const proyectos = await prisma.proyectos.findMany({
          where: { evento_id: evento.id },
          include: {
            equipos: true,
            calificaciones: {
              where: { juez_user_id: BigInt(userId) }
            }
          }
        });

        return {
          evento: {
            id: Number(evento.id),
            nombre: evento.nombre,
            fecha_inicio: evento.fecha_inicio,
            fecha_fin: evento.fecha_fin
          },
          proyectos: proyectos.map((p) => ({
            id: Number(p.id),
            nombre: p.nombre,
            equipo: p.equipos?.nombre || 'Sin equipo',
            evaluado: p.calificaciones.length > 0
          })),
          totalProyectos: proyectos.length,
          evaluados: proyectos.filter((p) => p.calificaciones.length > 0).length
        };
      })
    );

    return eventosConProyectos;
  }

  async getEvento(eventoId: number, juezId: number) {
    const evento = await prisma.eventos.findUnique({
      where: { id: BigInt(eventoId) },
      include: {
        criterio_evaluacion: true,
        proyectos: {
          include: {
            equipos: true,
            calificaciones: {
              where: { juez_user_id: BigInt(juezId) }
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
          include: { criterio_evaluacion: true }
        },
        equipos: true,
        calificaciones: {
          where: { juez_user_id: BigInt(juezId) }
        }
      }
    });

    if (!proyecto) return null;

    // Verificar si el juez está asignado a este evento
    const asignado = await prisma.evento_user.findFirst({
      where: {
        evento_id: proyecto.evento_id,
        user_id: BigInt(juezId)
      }
    });

    if (!asignado) throw { status: 403, message: 'No tienes permiso para evaluar este proyecto.' };

    const comentarioData = await prisma.evaluacion_comentarios.findFirst({
      where: {
        proyecto_id: BigInt(proyectoId),
        juez_user_id: BigInt(juezId)
      }
    });

    const calificacionesPrevias: Record<string, number> = {};
    proyecto.calificaciones.forEach((c) => {
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
          criterios: proyecto.eventos.criterio_evaluacion.map(c => ({
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
      comentarioPrevio: comentarioData?.comentario || ''
    };
  }

  async storeEvaluacion(proyectoId: number, juezId: number, dto: StoreEvaluacionDto) {
    // Para simplificar y simular upserts sin triggers de unique constraint si no existen,
    // buscamos si existe la calificacion por criterio o la creamos en un update manual.
    
    // Primero, validamos que el juez pertenezca al evento del proyecto
    const proyecto = await prisma.proyectos.findUnique({ where: { id: BigInt(proyectoId) }});
    if (!proyecto) throw { status: 404, message: 'Proyecto no encontrado' };

    const ops: any[] = [];

    // Por cada criterio
    for (const [criterioIdStr, puntuacion] of Object.entries(dto.puntuaciones)) {
      const criterioId = parseInt(criterioIdStr, 10);
      const existingCal = await prisma.calificaciones.findFirst({
        where: {
          proyecto_id: BigInt(proyectoId),
          juez_user_id: BigInt(juezId),
          criterio_id: BigInt(criterioId)
        }
      });

      if (existingCal) {
        ops.push(prisma.calificaciones.update({
          where: { id: existingCal.id },
          data: { puntuacion: puntuacion, updated_at: new Date() }
        }));
      } else {
        ops.push(prisma.calificaciones.create({
          data: {
            proyecto_id: BigInt(proyectoId),
            juez_user_id: BigInt(juezId),
            criterio_id: BigInt(criterioId),
            puntuacion: puntuacion,
            created_at: new Date(),
            updated_at: new Date()
          }
        }));
      }
    }

    // Comentario
    if (dto.comentario !== undefined) {
      const existingCom = await prisma.evaluacion_comentarios.findFirst({
        where: {
          proyecto_id: BigInt(proyectoId),
          juez_user_id: BigInt(juezId)
        }
      });

      if (existingCom) {
        ops.push(prisma.evaluacion_comentarios.update({
          where: { id: existingCom.id },
          data: { comentario: dto.comentario, updated_at: new Date() }
        }));
      } else {
        ops.push(prisma.evaluacion_comentarios.create({
          data: {
            proyecto_id: BigInt(proyectoId),
            juez_user_id: BigInt(juezId),
            comentario: dto.comentario,
            created_at: new Date(),
            updated_at: new Date()
          }
        }));
      }
    }

    await prisma.$transaction(ops);
  }
}
