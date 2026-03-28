import prisma from '../../utils/prisma';
import { CreateProyectoDto, UpdateProyectoDto, ProyectoQueryOptions } from './proyecto.types';

export class ProyectoRepository {
  async findAllPaginated(options: ProyectoQueryOptions) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const [count, rows] = await Promise.all([
      prisma.proyectos.count(),
      prisma.proyectos.findMany({
        include: {
          equipos: true,
          eventos: true
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    return { count, rows };
  }

  async findById(id: number) {
    return prisma.proyectos.findUnique({
      where: { id: BigInt(id) },
      include: {
        equipos: true,
        eventos: true,
        evaluaciones: true
      }
    });
  }

  async create(data: CreateProyectoDto) {
    return prisma.proyectos.create({
      data: {
        equipo_id: BigInt(data.equipo_id),
        evento_id: BigInt(data.evento_id),
        nombre: data.nombre,
        descripcion: data.descripcion,
        repositorio_url: data.repositorio_url,
        created_at: new Date(),
        updated_at: new Date(),
      }
    });
  }

  async update(id: number, data: UpdateProyectoDto) {
    const updateData: any = { updated_at: new Date() };
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.repositorio_url !== undefined) updateData.repositorio_url = data.repositorio_url;

    return prisma.proyectos.update({
      where: { id: BigInt(id) },
      data: updateData
    });
  }

  async delete(id: number) {
    return prisma.proyectos.delete({
      where: { id: BigInt(id) }
    });
  }
}
