import { EventoRepository } from './evento.repository';
import { CreateEventoDto, UpdateEventoDto, EventoQueryOptions } from './evento.types';
import { AppError } from '../../errors';




export class EventoService {
  constructor(private readonly eventoRepository: EventoRepository = new EventoRepository()) {}

  async getAllEventos(options: EventoQueryOptions) {
    const { count, rows } = await this.eventoRepository.findAllPaginated(options);
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
    const evento = await this.eventoRepository.findById(id);
    if (!evento) {
      throw new AppError(404, 'Evento no encontrado');
    }

    const jueces_asignados = evento.evento_jueces.length;
    const max_jueces = evento.max_jueces || 5;
    const suma_ponderacion = evento.evaluacion_criterios.reduce((acc: number, c: any) => acc + Number(c.ponderacion), 0);

    const formattedEvento = {
      ...evento,
      id: Number(evento.id),
      // Validación de lanzamiento
      validacion: {
        jueces_completos: jueces_asignados >= max_jueces,
        rubrica_completa: Math.abs(suma_ponderacion - 100) < 0.01,
        suma_ponderacion: Number(suma_ponderacion.toFixed(2)),
        jueces_asignados,
        max_jueces,
        listo_para_lanzar: (jueces_asignados >= max_jueces) && (Math.abs(suma_ponderacion - 100) < 0.01)
      },
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
    const inicio = new Date(data.fecha_inicio);
    const fin = new Date(data.fecha_fin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (inicio < hoy) {
      throw new AppError(400, 'La fecha de inicio no puede ser anterior a hoy.');
    }

    if (fin <= inicio) {
      throw new AppError(400, 'La fecha de finalización debe ser posterior a la fecha de inicio.');
    }

    const evento = await this.eventoRepository.create({
      nombre: data.nombre,
      descripcion: data.descripcion,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      max_jueces: data.max_jueces,
    });

    if (data.jueces && data.jueces.length > 0) {
      const prisma = (await import('../../prisma.config')).default;
      const conflicts: any[] = await prisma.$queryRaw`
        SELECT u.name 
        FROM users u
        JOIN equipo_miembros em ON em.user_id = u.id
        JOIN proyectos p ON p.equipo_id = em.equipo_id
        WHERE p.evento_id = ${BigInt(evento.id)}
          AND u.id IN (${data.jueces.map(jid => BigInt(jid))})
      `;

      if (conflicts.length > 0) {
        const names = conflicts.map(c => c.name).join(', ');
        throw new AppError(400, `No se pueden asignar como jueces a los siguientes participantes de este evento: ${names}`);
      }

      await this.eventoRepository.setJueces(Number(evento.id), data.jueces);
    }

    return {
      success: true,
      message: 'Evento creado exitosamente.',
      data: { ...evento, id: Number(evento.id) },
    };
  }

  async updateEvento(id: number, data: UpdateEventoDto) {
    const evento = await this.eventoRepository.findById(id);
    if (!evento) {
      throw new AppError(404, 'Evento no encontrado');
    }

    if (new Date() >= new Date(evento.fecha_inicio)) {
      throw new AppError(400, 'No se puede editar un evento que ya ha comenzado o finalizado.');
    }

    const nuevaFechaInicio = data.fecha_inicio ? new Date(data.fecha_inicio) : new Date(evento.fecha_inicio);
    const nuevaFechaFin = data.fecha_fin ? new Date(data.fecha_fin) : new Date(evento.fecha_fin);

    if (nuevaFechaFin <= nuevaFechaInicio) {
      throw new AppError(400, 'La fecha de finalización debe ser posterior a la fecha de inicio.');
    }

    await this.eventoRepository.update(id, data);

    if (data.jueces) {
      const prisma = (await import('../../prisma.config')).default;
      const conflicts: any[] = await prisma.$queryRaw`
        SELECT u.name 
        FROM users u
        JOIN equipo_miembros em ON em.user_id = u.id
        JOIN proyectos p ON p.equipo_id = em.equipo_id
        WHERE p.evento_id = ${BigInt(id)}
          AND u.id IN (${data.jueces.map(jid => BigInt(jid))})
      `;

      if (conflicts.length > 0) {
        const names = conflicts.map(c => c.name).join(', ');
        throw new AppError(400, `No se pueden asignar como jueces a los siguientes participantes de este evento: ${names}`);
      }

      await this.eventoRepository.setJueces(id, data.jueces);
    }

    return { success: true, message: 'Evento actualizado exitosamente.' };
  }

  async deleteEvento(id: number) {
    const evento = await this.eventoRepository.findById(id);
    if (!evento) {
      throw new AppError(404, 'Evento no encontrado');
    }

    if (new Date() >= new Date(evento.fecha_inicio)) {
      throw new AppError(400, 'No se puede eliminar un evento que ya ha comenzado.');
    }

    await this.eventoRepository.delete(id);
    return { success: true, message: 'Evento eliminado exitosamente.' };
  }

  async getAvailableJueces() {
    const jueces = await this.eventoRepository.getAvailableJueces();
    return {
      success: true,
      data: jueces.map((j) => ({
        id: Number(j.id),
        name: j.name,
        email: j.email,
      })),
    };
  }

  async addJuezToEvento(eventoId: number, userId: number) {
    // 1. Check if event exists
    const evento = await this.eventoRepository.findById(eventoId);
    if (!evento) throw new AppError(404, 'Evento no encontrado');

    const now = new Date();
    if (now > new Date(evento.fecha_fin)) {
        throw new AppError(400, 'No se pueden asignar jueces a un evento que ya ha finalizado.');
    }
    if (now >= new Date(evento.fecha_inicio)) {
        throw new AppError(400, 'No se pueden asignar jueces una vez que el evento ha comenzado.');
    }

    // 2. Check if user is already assigned
    const alreadyAssigned = evento.evento_jueces.some(ej => Number(ej.user_id) === userId);
    if (alreadyAssigned) throw new AppError(400, 'El juez ya está asignado a este evento');

    // 3. Conflict check: User must not be a participant in this event
    const prisma = (await import('../../prisma.config')).default;
    const conflicts: any[] = await prisma.$queryRaw`
      SELECT u.name 
      FROM users u
      JOIN equipo_miembros em ON em.user_id = u.id
      JOIN proyectos p ON p.equipo_id = em.equipo_id
      WHERE p.evento_id = ${BigInt(eventoId)}
        AND u.id = ${BigInt(userId)}
    `;

    if (conflicts.length > 0) {
      throw new AppError(400, `No se puede asignar como juez a ${conflicts[0].name} porque ya es participante en este evento.`);
    }

    await this.eventoRepository.addJuez(eventoId, userId);
    return { success: true, message: 'Juez asignado correctamente' };
  }

  async removeJuezFromEvento(eventoId: number, userId: number) {
    try {
      const evento = await this.eventoRepository.findById(eventoId);
      const now = new Date();
      if (evento) {
          if (now > new Date(evento.fecha_fin)) {
              throw new AppError(400, 'No se pueden remover jueces de un evento que ya ha finalizado.');
          }
          if (now >= new Date(evento.fecha_inicio)) {
              throw new AppError(400, 'No se pueden remover jueces una vez que el evento ha comenzado.');
          }
      }
      await this.eventoRepository.removeJuez(eventoId, userId);
      return { success: true, message: 'Juez removido correctamente' };
    } catch (error: any) {
      if (error.status) throw error;
      throw new AppError(400, 'El juez no está asignado a este evento o no se pudo remover');
    }
  }
}
