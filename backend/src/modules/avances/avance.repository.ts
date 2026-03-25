import prisma from '../../utils/prisma';
import { StoreAvanceDto } from './avance.types';

export class AvanceRepository {
  async getProyectoIdByUser(userId: number) {
    const participante = await prisma.participantes.findFirst({ where: { user_id: BigInt(userId) } });
    if (!participante) return null;

    const equipoLink = await prisma.equipo_participante.findFirst({
      where: { participante_id: participante.id },
      include: { equipos: { include: { proyectos: true } } }
    });

    if (!equipoLink || !equipoLink.equipos.proyectos[0]) return null;
    return Number(equipoLink.equipos.proyectos[0].id);
  }

  async getAllByProyectoId(proyectoId: number) {
    return prisma.avances.findMany({
      where: { proyecto_id: BigInt(proyectoId) },
      orderBy: [
        { fecha: 'desc' },
        { created_at: 'desc' }
      ]
    });
  }

  async create(proyectoId: number, dto: StoreAvanceDto) {
    return prisma.avances.create({
      data: {
        proyecto_id: BigInt(proyectoId),
        descripcion: dto.descripcion,
        fecha: new Date(dto.fecha),
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async findById(id: number) {
    return prisma.avances.findUnique({ where: { id: BigInt(id) } });
  }

  async destroy(id: number) {
    return prisma.avances.delete({ where: { id: BigInt(id) } });
  }
}
