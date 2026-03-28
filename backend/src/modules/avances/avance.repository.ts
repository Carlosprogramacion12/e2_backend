import prisma from '../../utils/prisma';
import { StoreAvanceDto } from './avance.types';

export class AvanceRepository {
  async getProyectoIdByUser(userId: number) {
    // Buscar el equipo del usuario directamente via equipo_miembros
    const miembro = await prisma.equipo_miembros.findFirst({
      where: { user_id: BigInt(userId) },
      include: { equipo: { include: { proyectos: true } } }
    });

    if (!miembro || !miembro.equipo.proyectos[0]) return null;
    return Number(miembro.equipo.proyectos[0].id);
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
        fecha: new Date(dto.fecha),
      }
    });
  }

  async findById(id: number) {
    return prisma.proyecto_avances.findUnique({ where: { id: BigInt(id) } });
  }

  async destroy(id: number) {
    return prisma.proyecto_avances.delete({ where: { id: BigInt(id) } });
  }
}

