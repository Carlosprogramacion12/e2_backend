import { JuezRepository } from './juez.repository';
import { StoreEvaluacionDto } from './juez.types';

const juezRepository = new JuezRepository();

export class JuezService {
  async getDashboardData(userId: number) {
    const eventos = await juezRepository.getDashboardData(userId);
    return { success: true, data: { eventos } };
  }

  async getEvento(eventoId: number, juezId: number) {
    const evento = await juezRepository.getEvento(eventoId, juezId);
    if (!evento) throw { status: 404, message: 'Evento no encontrado' };

    const formatEvento = {
      ...evento,
      id: Number(evento.id),
      criterios: evento.criterio_evaluacion.map(c => ({
        ...c,
        id: Number(c.id),
        evento_id: Number(c.evento_id)
      })),
      proyectos: evento.proyectos.map(p => ({
        ...p,
        id: Number(p.id),
        equipo_id: Number(p.equipo_id),
        evento_id: Number(p.evento_id),
        equipo: p.equipos ? {
          ...p.equipos,
          id: Number(p.equipos.id)
        } : null,
        calificaciones: p.calificaciones.map(cal => ({
          ...cal,
          id: Number(cal.id),
          proyecto_id: Number(cal.proyecto_id),
          juez_user_id: Number(cal.juez_user_id),
          criterio_id: Number(cal.criterio_id),
          puntuacion: Number(cal.puntuacion)
        }))
      }))
    };

    return { success: true, data: formatEvento };
  }

  async getEvaluacionData(proyectoId: number, juezId: number) {
    const data = await juezRepository.getEvaluacionData(proyectoId, juezId);
    if (!data) throw { status: 404, message: 'Proyecto no encontrado' };

    return { success: true, data };
  }

  async storeEvaluacion(proyectoId: number, juezId: number, dto: StoreEvaluacionDto) {
    await juezRepository.storeEvaluacion(proyectoId, juezId, dto);
    return { success: true, message: 'Evaluación guardada.' };
  }
}
