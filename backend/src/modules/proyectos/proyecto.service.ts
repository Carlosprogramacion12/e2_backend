import { ProyectoRepository } from './proyecto.repository';
import { CreateProyectoDto, UpdateProyectoDto, ProyectoQueryOptions } from './proyecto.types';

const proyectoRepository = new ProyectoRepository();

export class ProyectoService {
  async getAllProyectos(options: ProyectoQueryOptions) {
    const { count, rows } = await proyectoRepository.findAllPaginated(options);
    const limit = options.limit || 10;
    const page = options.page || 1;

    return {
      success: true,
      data: {
        proyectos: rows.map((p) => ({
          ...p,
          id: Number(p.id),
          equipo_id: Number(p.equipo_id),
          evento_id: Number(p.evento_id),
          equipo: p.equipos ? {
            ...p.equipos,
            id: Number(p.equipos.id)
          } : null,
          evento: p.eventos ? {
            ...p.eventos,
            id: Number(p.eventos.id)
          } : null
        })),
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    };
  }

  async getProyectoById(id: number) {
    const proyecto = await proyectoRepository.findById(id);
    if (!proyecto) {
      throw { status: 404, message: 'Proyecto no encontrado' };
    }

    const formatProyecto = {
      ...proyecto,
      id: Number(proyecto.id),
      equipo_id: Number(proyecto.equipo_id),
      evento_id: Number(proyecto.evento_id),
      equipo: proyecto.equipos ? {
        ...proyecto.equipos,
        id: Number(proyecto.equipos.id)
      } : null,
      evento: proyecto.eventos ? {
        ...proyecto.eventos,
        id: Number(proyecto.eventos.id)
      } : null,
      evaluaciones: (proyecto as any).evaluaciones.map((c: any) => ({
        ...c,
        id: Number(c.id),
        proyecto_id: Number(c.proyecto_id),
        juez_user_id: Number(c.juez_id),
        criterio_id: Number(c.criterio_id),
        puntuacion: Number(c.puntuacion)
      })),
      // Keep calificaciones alias for frontend compatibility
      calificaciones: (proyecto as any).evaluaciones.map((c: any) => ({
        ...c,
        id: Number(c.id),
        proyecto_id: Number(c.proyecto_id),
        juez_user_id: Number(c.juez_id),
        criterio_id: Number(c.criterio_id),
        puntuacion: Number(c.puntuacion)
      }))
    };

    return { success: true, data: formatProyecto };
  }

  async createProyecto(data: CreateProyectoDto) {
    const proyecto = await proyectoRepository.create(data);
    return {
      success: true,
      message: 'Proyecto creado.',
      data: {
        ...proyecto,
        id: Number(proyecto.id),
        equipo_id: Number(proyecto.equipo_id),
        evento_id: Number(proyecto.evento_id)
      }
    };
  }

  async updateProyecto(id: number, data: UpdateProyectoDto) {
    const proyecto = await proyectoRepository.findById(id);
    if (!proyecto) {
      throw { status: 404, message: 'Proyecto no encontrado' };
    }

    await proyectoRepository.update(id, data);
    return { success: true, message: 'Proyecto actualizado.' };
  }

  async deleteProyecto(id: number) {
    const proyecto = await proyectoRepository.findById(id);
    if (!proyecto) {
      throw { status: 404, message: 'Proyecto no encontrado' };
    }

    await proyectoRepository.delete(id);
    return { success: true, message: 'Proyecto eliminado.' };
  }
}
