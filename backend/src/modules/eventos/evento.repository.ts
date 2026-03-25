import prisma from '../../utils/prisma';
import { CreateEventoDto, UpdateEventoDto, EventoQueryOptions } from './evento.types';

export class EventoRepository {
  async findAllPaginated(options: EventoQueryOptions) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const [count, rows] = await Promise.all([
      prisma.eventos.count(),
      prisma.eventos.findMany({
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    return { count, rows };
  }

  async findById(id: number) {
    return prisma.eventos.findUnique({
      where: { id: BigInt(id) },
      include: {
        criterio_evaluacion: true,
        evento_user: {
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

    return prisma.eventos.update({
      where: { id: BigInt(id) },
      data: updateData,
    });
  }

  async delete(id: number) {
    return prisma.eventos.delete({ where: { id: BigInt(id) } });
  }

  async setJueces(eventoId: number, juecesIds: number[]) {
    // Eliminar jueces actuales
    await prisma.evento_user.deleteMany({
      where: { evento_id: BigInt(eventoId) },
    });

    // Insertar nuevos
    if (juecesIds.length > 0) {
      await prisma.evento_user.createMany({
        data: juecesIds.map((userId) => ({
          evento_id: BigInt(eventoId),
          user_id: BigInt(userId),
        })),
      });
    }
  }

  async getAvailableJueces() {
    return prisma.users.findMany({
      where: {
        user_rol: {
          some: {
            roles: {
              nombre: 'Juez',
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
}
