import prisma from '../../prisma.config';
import { StoreEvaluacionDto } from './juez.types';
import { AppError } from '../../errors';


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
          where: {
            evento_id: evento.id,
            equipos: {
              equipo_miembros: { some: {} } // at least 1
            }
          },
          include: {
            equipos: {
              include: { _count: { select: { equipo_miembros: true } } }
            },
            evaluaciones: {
              where: { juez_id: BigInt(userId) }
            }
          }
        });

        // Solo mostrar equipos completos (5/5)
        const proyectosCompletos = proyectos.filter(
          p => (p.equipos?._count?.equipo_miembros ?? 0) >= 5
        );

        return {
          id: Number(evento.id),
          nombre: evento.nombre,
          descripcion: evento.descripcion,
          fecha_inicio: evento.fecha_inicio,
          fecha_fin: evento.fecha_fin,
          proyectos: proyectosCompletos.map((p) => ({
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
          where: {
            equipos: {
              equipo_miembros: { some: {} } // filtro rapido, completitud verificada en JS
            }
          },
          include: {
            equipos: {
              include: {
                equipo_miembros: true
              }
            },
            evaluaciones: true // Traer todas para calcular ranking global si es necesario
          }
        }
      }
    });

    if (!evento) return null;

    // Filter evaluations for the specific judge + solo equipos con 5 miembros
    const formattedProyectos = evento.proyectos
      .filter(p => (p.equipos?.equipo_miembros?.length ?? 0) >= 5)
      .map(p => {
      const myEvals = p.evaluaciones.filter(e => e.juez_id === BigInt(juezId));
      const totalScore = p.evaluaciones.reduce((acc, e) => acc + Number(e.puntuacion), 0);
      
      return {
        ...p,
        id: Number(p.id),
        equipo_id: Number(p.equipo_id),
        evento_id: Number(p.evento_id),
        equipo: p.equipos ? {
          ...p.equipos,
          id: Number(p.equipos.id),
          miembros_count: p.equipos.equipo_miembros.length
        } : null,
        yaCalificado: myEvals.length > 0,
        totalScore // Para ranking
      };
    });

    return {
      id: Number(evento.id),
      nombre: evento.nombre,
      descripcion: evento.descripcion,
      fecha_inicio: evento.fecha_inicio,
      fecha_fin: evento.fecha_fin,
      proyectos: formattedProyectos,
      evaluacion_criterios: evento.evaluacion_criterios.map(c => ({
        ...c,
        id: Number(c.id),
        evento_id: Number(c.evento_id),
        ponderacion: Number(c.ponderacion)
      }))
    };
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

    if (!asignado) throw new AppError(403, 'No tienes permiso para evaluar este proyecto.');

    const comentarioEval = proyecto.evaluaciones.find((e: any) => e.comentario);

    const calificacionesPrevias: Record<string, number> = {};
    proyecto.evaluaciones.forEach((e: any) => {
      // Return raw score (0-100) exactly as stored
      calificacionesPrevias[e.criterio_id.toString()] = Number(e.puntuacion);
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
    const proyecto = await prisma.proyectos.findUnique({ 
      where: { id: BigInt(proyectoId) },
      include: { eventos: { include: { evaluacion_criterios: true } } }
    });
    if (!proyecto) throw new AppError(404, 'Proyecto no encontrado');

    // Verificar si el evento ha iniciado o finalizado
    const now = new Date();
    if (proyecto.eventos) {
      if (now < proyecto.eventos.fecha_inicio) {
        throw new AppError(403, 'El periodo de evaluación aún no ha comenzado. El evento inicia el ' + proyecto.eventos.fecha_inicio.toLocaleString() + '.');
      }
      if (now > proyecto.eventos.fecha_fin) {
        throw new AppError(403, 'El periodo de evaluación para este evento ha finalizado. Los cambios no se han guardado.');
      }
    }

    const ops: any[] = [];
    const comentario = dto.comentario || '';

    // Si no se pasaron puntuaciones, al menos guardamos el comentario en las existentes
    if (!dto.puntuaciones || Object.keys(dto.puntuaciones).length === 0) {
      await prisma.evaluaciones.updateMany({
        where: { proyecto_id: BigInt(proyectoId), juez_id: BigInt(juezId) },
        data: { comentario, created_at: new Date() }
      });
      return;
    }

    for (const [criterioIdStr, puntuacion] of Object.entries(dto.puntuaciones)) {
      const criterioId = parseInt(criterioIdStr, 10);
      const now = new Date();
      
      const criterion = proyecto.eventos.evaluacion_criterios.find(c => Number(c.id) === criterioId);
      if (!criterion) throw new AppError(400, `Criterio ${criterioId} no válido para este evento.`);
      
      const weight = Number(criterion.ponderacion);
      const inputScore = Number(puntuacion);

      // Now we allow 0-100 range for everything
      if (inputScore < 0 || inputScore > 100) {
        throw new AppError(400, `La puntuación para "${criterion.nombre}" (${inputScore}) debe estar entre 0 y 100.`);
      }

      const existingEval = await prisma.evaluaciones.findFirst({
        where: {
          proyecto_id: BigInt(proyectoId),
          juez_id: BigInt(juezId),
          criterio_id: BigInt(criterioId)
        }
      });

      if (existingEval) {
        ops.push(prisma.evaluaciones.update({
          where: { id: existingEval.id },
          data: { puntuacion: inputScore as any, comentario, created_at: now }
        }));
      } else {
        ops.push(prisma.evaluaciones.create({
          data: {
            proyecto_id: BigInt(proyectoId),
            juez_id: BigInt(juezId),
            criterio_id: BigInt(criterioId),
            puntuacion: inputScore as any,
            comentario,
            created_at: now
          }
        }));
      }
    }

    await prisma.$transaction(ops);
  }
}
