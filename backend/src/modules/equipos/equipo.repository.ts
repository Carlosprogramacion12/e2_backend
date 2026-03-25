import prisma from '../../utils/prisma';
import { UpdateEquipoDto, AddMiembroDto, EquipoQueryOptions } from './equipo.types';

export class EquipoRepository {
  async findAllPaginated(options: EquipoQueryOptions) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const [count, rows] = await Promise.all([
      prisma.equipos.count(),
      prisma.equipos.findMany({
        include: {
          proyectos: {
            include: { eventos: true }
          },
          equipo_participante: {
            include: {
              participantes: {
                include: { users: true }
              },
              perfiles: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    return { count, rows };
  }

  async findById(id: number) {
    return prisma.equipos.findUnique({
      where: { id: BigInt(id) },
      include: {
        proyectos: {
          include: { eventos: true }
        },
        equipo_participante: {
          include: {
            participantes: {
              include: { 
                users: true,
                carreras: true 
              }
            },
            perfiles: true
          }
        }
      }
    });
  }

  async update(id: number, data: UpdateEquipoDto) {
    const updateData: any = { updated_at: new Date() };
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.max_programadores !== undefined) updateData.max_programadores = data.max_programadores;
    if (data.max_disenadores !== undefined) updateData.max_disenadores = data.max_disenadores;
    if (data.max_testers !== undefined) updateData.max_testers = data.max_testers;

    return prisma.equipos.update({
      where: { id: BigInt(id) },
      data: updateData
    });
  }

  async delete(id: number) {
    return prisma.equipos.delete({
      where: { id: BigInt(id) }
    });
  }

  async addMiembro(equipoId: number, data: AddMiembroDto) {
    return prisma.equipo_participante.create({
      data: {
        equipo_id: BigInt(equipoId),
        participante_id: BigInt(data.participante_id),
        perfil_id: BigInt(data.perfil_id),
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async removeMiembro(equipoId: number, participanteId: number) {
    return prisma.equipo_participante.deleteMany({
      where: {
        equipo_id: BigInt(equipoId),
        participante_id: BigInt(participanteId)
      }
    });
  }
}
