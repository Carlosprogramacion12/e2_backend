import { EventoRepository } from './evento.repository';
import { CreateEventoDto, UpdateEventoDto, EventoQueryOptions } from './evento.types';

const eventoRepository = new EventoRepository();

export class EventoService {
  async getAllEventos(options: EventoQueryOptions) {
    const { count, rows } = await eventoRepository.findAllPaginated(options);
    const limit = options.limit || 10;
    const page = options.page || 1;

    return {
      success: true,
      data: {
        eventos: rows.map((e) => ({
          ...e,
          id: Number(e.id),
        })),
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    };
  }

  async getEventoById(id: number) {
    const evento = await eventoRepository.findById(id);
    if (!evento) {
      throw { status: 404, message: 'Evento no encontrado' };
    }

    const formattedEvento = {
      ...evento,
      id: Number(evento.id),
      // Frontend expects criterio_evaluacion array
      criterio_evaluacion: evento.evaluacion_criterios.map((c: any) => ({
        ...c,
        id: Number(c.id),
        evento_id: Number(c.evento_id),
        ponderacion: Number(c.ponderacion)
      })),
      // Frontend expects jueces array
      jueces: evento.evento_jueces.map((ej: any) => ({
        id: Number(ej.users.id),
        name: ej.users.name,
        email: ej.users.email,
      })),
    };

    return { success: true, data: formattedEvento };
  }

  async createEvento(data: CreateEventoDto) {
    const evento = await eventoRepository.create({
      nombre: data.nombre,
      descripcion: data.descripcion,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
    });

    if (data.jueces && data.jueces.length > 0) {
      await eventoRepository.setJueces(Number(evento.id), data.jueces);
    }

    return {
      success: true,
      message: 'Evento creado exitosamente.',
      data: { ...evento, id: Number(evento.id) },
    };
  }

  async updateEvento(id: number, data: UpdateEventoDto) {
    const evento = await eventoRepository.findById(id);
    if (!evento) {
      throw { status: 404, message: 'Evento no encontrado' };
    }

    await eventoRepository.update(id, data);

    if (data.jueces) {
      await eventoRepository.setJueces(id, data.jueces);
    }

    return { success: true, message: 'Evento actualizado exitosamente.' };
  }

  async deleteEvento(id: number) {
    const evento = await eventoRepository.findById(id);
    if (!evento) {
      throw { status: 404, message: 'Evento no encontrado' };
    }

    await eventoRepository.delete(id);
    return { success: true, message: 'Evento eliminado exitosamente.' };
  }

  async getAvailableJueces() {
    const jueces = await eventoRepository.getAvailableJueces();
    return {
      success: true,
      data: jueces.map((j) => ({
        id: Number(j.id),
        name: j.name,
        email: j.email,
      })),
    };
  }
}
