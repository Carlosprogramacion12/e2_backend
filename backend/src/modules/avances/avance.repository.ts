import prisma from '../../prisma.config';
import { StoreAvanceDto } from './avance.types';

export class AvanceRepository {
  async getProyectoIdByUser(userId: number, targetProyectoId?: number) {
    if (targetProyectoId) {
      // Verificar si el usuario pertenece al proyecto solicitado
      const miembro = await prisma.equipo_miembros.findFirst({
        where: { 
          user_id: BigInt(userId),
          equipos: { proyectos: { some: { id: BigInt(targetProyectoId) } } }
        }
      });
      return miembro ? targetProyectoId : null;
    }

    // Comportamiento original: Buscar el primer equipo/proyecto del usuario
    const miembro = await prisma.equipo_miembros.findFirst({
      where: { user_id: BigInt(userId) },
      include: { equipos: { include: { proyectos: true } } }
    });

    if (!miembro || !miembro.equipos.proyectos[0]) return null;
    return Number(miembro.equipos.proyectos[0].id);
  }

  async getAllByProyectoId(proyectoId: number) {
    return prisma.proyecto_avances.findMany({
      where: { proyecto_id: BigInt(proyectoId) },
      orderBy: [
        { fecha: 'desc' }
      ]
    });
  }

  async create(proyectoId: number, dto: StoreAvanceDto) {
    return prisma.proyecto_avances.create({
      data: {
        proyecto_id: BigInt(proyectoId),
        descripcion: dto.descripcion,
      }
    });
  }

  async findById(id: number) {
    return prisma.proyecto_avances.findUnique({ where: { id: BigInt(id) } });
  }

  async destroy(id: number) {
    return prisma.proyecto_avances.delete({ where: { id: BigInt(id) } });
  }

  async update(id: number, descripcion: string, fecha?: Date) {
    return prisma.proyecto_avances.update({
      where: { id: BigInt(id) },
      data: { 
        descripcion,
        ...(fecha && { fecha })
      }
    });
  }

  async getEventoByProyectoId(proyectoId: number) {
    const proyecto = await prisma.proyectos.findUnique({
      where: { id: BigInt(proyectoId) },
      include: { eventos: true }
    });
    return proyecto?.eventos;
  }
}

