import { EquipoRepository } from './equipo.repository';
import { UpdateEquipoDto, AddMiembroDto, EquipoQueryOptions } from './equipo.types';
import prisma from '../../prisma.config';
import { AppError } from '../../errors';




const ROL_MAP: Record<string, string> = {
  'LIDER': 'Líder', 'PROGRAMADOR': 'Programador', 'DISENADOR': 'Diseñador', 'TESTER': 'Tester'
};

export class EquipoService {
  constructor(private readonly equipoRepository: EquipoRepository = new EquipoRepository()) {}

  async getAllEquipos(options: EquipoQueryOptions) {
    const { count, rows } = await this.equipoRepository.findAllPaginated(options);
    const limit = options.limit || 10;
    const page = options.page || 1;

    const equiposFormateados = rows.map((e: any) => ({
      ...e,
      id: Number(e.id),
      proyectos: undefined,
      proyecto: (() => {
        if (!e.proyectos || e.proyectos.length === 0) return null;
        const p = options.evento_id 
          ? e.proyectos.find((proj: any) => Number(proj.evento_id) === options.evento_id) || e.proyectos[0]
          : e.proyectos[0];
        
        return {
          ...p,
          id: Number(p.id),
          equipo_id: Number(p.equipo_id),
          evento_id: Number(p.evento_id),
          evento: p.eventos ? {
            ...p.eventos,
            id: Number(p.eventos.id)
          } : null,
        };
      })(),

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

  async createEquipo(data: any) {
    const eq = await this.equipoRepository.create(data);
    return { success: true, data: { ...eq, id: Number(eq.id), equipo: { id: Number(eq.id) } }, message: 'Equipo creado.' };
  }

  async getEquipoById(id: number) {
    const equipo = await this.equipoRepository.findById(id);
    if (!equipo) {
      throw new AppError(404, 'Equipo no encontrado');
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
      todos_los_proyectos: (equipo.proyectos || []).map((p: any) => ({
        ...p,
        id: Number(p.id),
        equipo_id: Number(p.id),
        evento_id: Number(p.evento_id),
        evento: p.eventos ? {
          ...p.eventos,
          id: Number(p.eventos.id)
        } : null
      })),
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
    const equipo = await this.equipoRepository.findById(id);
    if (!equipo) throw new AppError(404, 'Equipo no encontrado');

    await this.equipoRepository.update(id, data);
    return { success: true, message: 'Equipo actualizado.' };
  }

  async deleteEquipo(id: number) {
    const equipo = await this.equipoRepository.findById(id);
    if (!equipo) throw new AppError(404, 'Equipo no encontrado');

    await this.equipoRepository.delete(id);
    return { success: true, message: 'Equipo eliminado.' };
  }

  async addMember(equipoId: number, data: AddMiembroDto) {
    const equipo = await this.equipoRepository.findById(equipoId);
    if (!equipo) throw new AppError(404, 'Equipo no encontrado');

    // 0. Check capacity limit (Max 5 members)
    if (equipo.equipo_miembros.length >= 5) {
      throw new AppError(400, 'El equipo ya ha alcanzado el límite máximo de 5 integrantes.');
    }

    // 1. Check if user is already in THIS team
    const isAlreadyMember = equipo.equipo_miembros.some(
      (em: any) => Number(em.user_id) === data.participante_id
    );
    if (isAlreadyMember) {
      throw new AppError(400, 'El participante ya es miembro de este equipo.');
    }

    // 2. Check if team is full (Max 5 members)
    if (equipo.equipo_miembros.length >= 5) {
      throw new AppError(400, 'El equipo ya ha alcanzado el límite máximo de 5 integrantes.');
    }

    // 2. Check if user is already in ANOTHER team for the SAME event
    if (equipo.proyectos && equipo.proyectos.length > 0) {
      const eventoId = Number(equipo.proyectos[0].evento_id);

      const conflicts: any[] = await prisma.$queryRaw`
        SELECT em.id 
        FROM equipo_miembros em
        JOIN proyectos p ON p.equipo_id = em.equipo_id
        WHERE em.user_id = ${BigInt(data.participante_id)}
          AND p.evento_id = ${BigInt(eventoId)}
        LIMIT 1
      `;

      if (conflicts.length > 0) {
        throw new AppError(400, 'El participante ya pertenece a otro equipo en este mismo evento. No se puede agregar hasta que finalice el evento.');
      }
    }

    // 3. Prevent adding a LIDER via admin (Leaders should be the creators)
    const perfiles: any[] = await prisma.$queryRaw`SELECT nombre FROM perfiles WHERE id = ${data.perfil_id} LIMIT 1`;
    const perfilNombre = perfiles.length > 0 ? perfiles[0].nombre.toUpperCase() : '';
    if (perfilNombre.includes('LIDER') || perfilNombre.includes('LÍDER')) {
      throw new AppError(400, 'No se puede agregar un nuevo Líder. El líder es asignado automáticamente al crear el equipo.');
    }

    await this.equipoRepository.addMiembro(equipoId, data);
    return { success: true, message: 'Miembro agregado al equipo.' };
  }

  async removeMember(equipoId: number, userId: number) {
    const prisma = (await import('../../prisma.config')).default;
    
    // Check if the member being removed is a LIDER
    const membership = await prisma.equipo_miembros.findFirst({
      where: { equipo_id: BigInt(equipoId), user_id: BigInt(userId) }
    });

    if (!membership) throw new AppError(404, 'Miembro no encontrado en este equipo.');

    const isLider = membership.rol === 'LIDER';

    await prisma.$transaction(async (tx) => {
      // 1. Remove the member
      await tx.equipo_miembros.delete({
        where: { id: membership.id }
      });

      // 2. If it was the leader, promote another one
      if (isLider) {
        const nextInLine = await tx.equipo_miembros.findFirst({
          where: { equipo_id: BigInt(equipoId) },
          orderBy: { created_at: 'asc' }
        });

        if (nextInLine) {
          await tx.equipo_miembros.update({
            where: { id: nextInLine.id },
            data: { rol: 'LIDER' }
          });
        }
      }
    });

    return { success: true, message: 'Miembro eliminado. El liderazgo ha sido actualizado automáticamente.' };
  }
}
