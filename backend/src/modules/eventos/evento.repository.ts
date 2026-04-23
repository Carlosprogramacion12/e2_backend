import prisma from '../../prisma.config';
import { CreateEventoDto, UpdateEventoDto, EventoQueryOptions } from './evento.types';

export class EventoRepository {
  async findAllPaginated(options: EventoQueryOptions) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const [count, rows] = await Promise.all([
      prisma.eventos.count(),
      // Ordenamos: primero los que NO han terminado (fecha_fin >= hoy) 
      // y al final los que ya terminaron.
      prisma.$queryRaw<any[]>`
        SELECT * FROM eventos 
        ORDER BY 
          CASE WHEN fecha_fin >= NOW() THEN 0 ELSE 1 END ASC,
          CASE WHEN fecha_fin >= NOW() THEN fecha_inicio ELSE fecha_fin END ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
    ]);

    return { count, rows };
  }

  async findById(id: number) {
    return prisma.eventos.findUnique({
      where: { id: BigInt(id) },
      include: {
        evaluacion_criterios: true,
        evento_jueces: {
          include: { users: true },
        },
      },
    });
  }

  async create(data: Omit<CreateEventoDto, 'jueces'>) {
    return prisma.eventos.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        fecha_inicio: new Date(data.fecha_inicio),
        fecha_fin: new Date(data.fecha_fin),
        max_jueces: data.max_jueces || 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async update(id: number, data: Omit<UpdateEventoDto, 'jueces'>) {
    const updateData: any = { updated_at: new Date() };
    if (data.nombre) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.fecha_inicio) updateData.fecha_inicio = new Date(data.fecha_inicio);
    if (data.fecha_fin) updateData.fecha_fin = new Date(data.fecha_fin);
    if (data.max_jueces !== undefined) updateData.max_jueces = data.max_jueces;


    return prisma.eventos.update({
      where: { id: BigInt(id) },
      data: updateData,
    });
  }

  async delete(id: number) {
    return prisma.eventos.delete({ where: { id: BigInt(id) } });
  }

  async setJueces(eventoId: number, juecesIds: number[]) {
    // Delete existing judges
    await prisma.evento_jueces.deleteMany({
      where: { evento_id: BigInt(eventoId) },
    });

    // Create new assignments
    if (juecesIds.length > 0) {
      await prisma.evento_jueces.createMany({
        data: juecesIds.map((userId) => ({
          evento_id: BigInt(eventoId),
          user_id: BigInt(userId),
        })),
      });
    }
  }

  async addJuez(eventoId: number, userId: number) {
    return prisma.evento_jueces.create({
      data: {
        evento_id: BigInt(eventoId),
        user_id: BigInt(userId),
      },
    });
  }

  async removeJuez(eventoId: number, userId: number) {
    return prisma.evento_jueces.delete({
      where: {
        evento_id_user_id: {
          evento_id: BigInt(eventoId),
          user_id: BigInt(userId),
        },
      },
    });
  }

  async getAvailableJueces() {
    // New schema: users with role = 'JUEZ'
    const jueces = await prisma.users.findMany({
      where: { role: 'JUEZ' },
      select: { id: true, name: true, email: true }
    });
    return jueces;
  }
}
