import { EquipoRepository } from './equipo.repository';
import { UpdateEquipoDto, AddMiembroDto, EquipoQueryOptions } from './equipo.types';

const equipoRepository = new EquipoRepository();

const ROL_MAP: Record<string, string> = {
  'LIDER': 'Líder', 'PROGRAMADOR': 'Programador', 'DISENADOR': 'Diseñador', 'TESTER': 'Tester'
};

export class EquipoService {
  async getAllEquipos(options: EquipoQueryOptions) {
    const { count, rows } = await equipoRepository.findAllPaginated(options);
    const limit = options.limit || 10;
    const page = options.page || 1;

    const equiposFormateados = rows.map((e: any) => ({
      ...e,
      id: Number(e.id),
      proyectos: undefined,
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
      participantes: e.equipo_miembros.map((em: any) => ({
        id: Number(em.users.id),
        user_id: Number(em.users.id),
        carrera_id: null,
        user: {
          id: Number(em.users.id),
          name: em.users.name,
          email: em.users.email,
        },
        carrera: em.users.carrera ? { nombre: em.users.carrera } : null,
        equipo_participante: {
          perfil_id: em.rol === 'LIDER' ? 1 : em.rol === 'PROGRAMADOR' ? 2 : em.rol === 'DISENADOR' ? 3 : 4,
          perfil: ROL_MAP[em.rol] || em.rol
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
      participantes: equipo.equipo_miembros.map((em: any) => ({
        id: Number(em.users.id),
        user_id: Number(em.users.id),
        carrera_id: null,
        user: {
          id: Number(em.users.id),
          name: em.users.name,
          email: em.users.email,
        },
        carrera: em.users.carrera ? { nombre: em.users.carrera } : null,
        equipo_participante: {
          perfil_id: em.rol === 'LIDER' ? 1 : em.rol === 'PROGRAMADOR' ? 2 : em.rol === 'DISENADOR' ? 3 : 4,
          perfil: ROL_MAP[em.rol] || em.rol
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

  async removeMember(equipoId: number, userId: number) {
    await equipoRepository.removeMiembro(equipoId, userId);
    return { success: true, message: 'Miembro eliminado del equipo.' };
  }
}
