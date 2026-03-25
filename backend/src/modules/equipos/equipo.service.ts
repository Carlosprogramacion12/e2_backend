import { EquipoRepository } from './equipo.repository';
import { UpdateEquipoDto, AddMiembroDto, EquipoQueryOptions } from './equipo.types';

const equipoRepository = new EquipoRepository();

export class EquipoService {
  async getAllEquipos(options: EquipoQueryOptions) {
    const { count, rows } = await equipoRepository.findAllPaginated(options);
    const limit = options.limit || 10;
    const page = options.page || 1;

    // Formatear igual al response Legacy Sequelize
    const equiposFormateados = rows.map((e) => ({
      ...e,
      id: Number(e.id),
      proyectos: undefined, // Remover del root
      proyecto: e.proyectos && e.proyectos.length > 0 ? {
        ...e.proyectos[0],
        id: Number(e.proyectos[0].id),
        equipo_id: Number(e.proyectos[0].equipo_id),
        evento_id: Number(e.proyectos[0].evento_id),
        evento: e.proyectos[0].eventos ? {
          ...e.proyectos[0].eventos,
          id: Number(e.proyectos[0].eventos.id)
        } : null,
      } : null,
      participantes: e.equipo_participante.map((ep) => ({
        ...ep.participantes,
        id: Number(ep.participantes.id),
        user_id: Number(ep.participantes.user_id),
        carrera_id: Number(ep.participantes.carrera_id),
        user: {
          id: Number(ep.participantes.users.id),
          name: ep.participantes.users.name,
          email: ep.participantes.users.email,
        },
        equipo_participante: {
          perfil_id: Number(ep.perfil_id)
        }
      }))
    }));

    return {
      success: true,
      data: {
        equipos: equiposFormateados,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    };
  }

  async getEquipoById(id: number) {
    const equipo = await equipoRepository.findById(id);
    if (!equipo) {
      throw { status: 404, message: 'Equipo no encontrado' };
    }

    const formatEquipo = {
      ...equipo,
      id: Number(equipo.id),
      proyectos: undefined,
      proyecto: equipo.proyectos && equipo.proyectos.length > 0 ? {
        ...equipo.proyectos[0],
        id: Number(equipo.proyectos[0].id),
        equipo_id: Number(equipo.proyectos[0].equipo_id),
        evento_id: Number(equipo.proyectos[0].evento_id),
        evento: equipo.proyectos[0].eventos ? {
          ...equipo.proyectos[0].eventos,
          id: Number(equipo.proyectos[0].eventos.id)
        } : null,
      } : null,
      participantes: equipo.equipo_participante.map((ep) => ({
        ...ep.participantes,
        id: Number(ep.participantes.id),
        user_id: Number(ep.participantes.user_id),
        carrera_id: Number(ep.participantes.carrera_id),
        user: {
          id: Number(ep.participantes.users.id),
          name: ep.participantes.users.name,
          email: ep.participantes.users.email,
        },
        carrera: ep.participantes.carreras ? {
          ...ep.participantes.carreras,
          id: Number(ep.participantes.carreras.id)
        } : null,
        equipo_participante: {
          perfil_id: Number(ep.perfil_id) // Compatibility with legacy Vue code accessing `participante.equipo_participante.perfil_id`
        }
      }))
    };

    return { success: true, data: formatEquipo };
  }

  async updateEquipo(id: number, data: UpdateEquipoDto) {
    const equipo = await equipoRepository.findById(id);
    if (!equipo) throw { status: 404, message: 'Equipo no encontrado' };

    await equipoRepository.update(id, data);
    return { success: true, message: 'Equipo actualizado.' };
  }

  async deleteEquipo(id: number) {
    const equipo = await equipoRepository.findById(id);
    if (!equipo) throw { status: 404, message: 'Equipo no encontrado' };

    await equipoRepository.delete(id);
    return { success: true, message: 'Equipo eliminado.' };
  }

  async addMember(equipoId: number, data: AddMiembroDto) {
    const equipo = await equipoRepository.findById(equipoId);
    if (!equipo) throw { status: 404, message: 'Equipo no encontrado' };

    await equipoRepository.addMiembro(equipoId, data);
    return { success: true, message: 'Miembro agregado al equipo.' };
  }

  async removeMember(equipoId: number, participanteId: number) {
    await equipoRepository.removeMiembro(equipoId, participanteId);
    return { success: true, message: 'Miembro eliminado del equipo.' };
  }
}
