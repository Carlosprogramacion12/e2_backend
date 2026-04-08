import prisma from "../../utils/prisma";
import {
  UpdateEquipoDto,
  AddMiembroDto,
  EquipoQueryOptions,
} from "./equipo.types";

export class EquipoRepository {
  async findAllPaginated(options: EquipoQueryOptions) {
    const { page = 1, limit = 10, search, evento_id } = options;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.nombre = { contains: search };
    }
    if (evento_id) {
      where.proyectos = { some: { evento_id: BigInt(evento_id) } };
    }

    const [count, rows] = await Promise.all([
      prisma.equipos.count({ where }),
      prisma.equipos.findMany({
        where,
        include: {
          proyectos: {
            include: { eventos: true },
          },
          equipo_miembros: {
            include: {
              users: {
                select: { id: true, name: true, email: true, carrera: true },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip: offset,
        take: limit,
      }),
    ]);

    return { count, rows };
  }

  async create(data: any) {
    return prisma.equipos.create({
      data: {
        nombre: data.nombre,
        max_programadores: data.max_programadores || 2,
        max_disenadores: data.max_disenadores || 1,
        max_testers: data.max_testers || 1,
        updated_at: new Date(),
      },
    });
  }

  async findById(id: number) {
    return prisma.equipos.findUnique({
      where: { id: BigInt(id) },
      include: {
        proyectos: {
          include: { eventos: true },
        },
        equipo_miembros: {
          include: {
            users: {
              select: { id: true, name: true, email: true, carrera: true },
            },
          },
        },
      },
    });
  }

  async update(id: number, data: UpdateEquipoDto) {
    const updateData: any = { updated_at: new Date() };
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.max_programadores !== undefined)
      updateData.max_programadores = data.max_programadores;
    if (data.max_disenadores !== undefined)
      updateData.max_disenadores = data.max_disenadores;
    if (data.max_testers !== undefined)
      updateData.max_testers = data.max_testers;

    return prisma.equipos.update({
      where: { id: BigInt(id) },
      data: updateData,
    });
  }

  async delete(id: number) {
    return prisma.equipos.delete({
      where: { id: BigInt(id) },
    });
  }

  async addMiembro(equipoId: number, data: AddMiembroDto) {
    // Buscar el nombre del perfil dinámicamente
    const perfiles: any[] = await prisma.$queryRaw`SELECT nombre FROM perfiles WHERE id = ${data.perfil_id} LIMIT 1`;
    const perfilNombre = perfiles.length > 0 ? perfiles[0].nombre : 'TESTER';

    // Mapear el nombre a los roles esperados por el sistema (LIDER, PROGRAMADOR, etc.)
    // Pero preservamos el caso original como desea el usuario
    let rolFinal = perfilNombre || 'Tester';
    const upperRol = rolFinal.toUpperCase();
    
    if (upperRol.includes('LÍDER') || upperRol.includes('LIDER')) rolFinal = 'LIDER';
    else if (upperRol.includes('PROGRAMADOR')) rolFinal = 'PROGRAMADOR';
    else if (upperRol.includes('DISEÑADOR') || upperRol.includes('DISENADOR')) rolFinal = 'DISENADOR';
    else if (upperRol.includes('TESTER')) rolFinal = 'TESTER';
    // Para cualquier otro como "Analista", se queda como "Analista"
    
    // Asegurar que no exceda los 50 caracteres del esquema
    rolFinal = rolFinal.substring(0, 50);

    const eqId = Number(equipoId);
    const partId = Number(data.participante_id);

    try {
      // Usar SQL directo para evitar validaciones del lado de Prisma que puedan estar desactualizadas
      await prisma.$executeRawUnsafe(
        'INSERT INTO equipo_miembros (equipo_id, user_id, rol, created_at) VALUES (?, ?, ?, ?)',
        BigInt(eqId),
        BigInt(partId),
        rolFinal,
        new Date()
      );
      
      // Retornar el objeto creado buscando por equipo y usuario (ya que no tenemos el ID retornado fácilmente por $executeRaw)
      return await prisma.equipo_miembros.findFirst({
        where: {
          equipo_id: BigInt(eqId),
          user_id: BigInt(partId),
          rol: rolFinal
        },
        orderBy: { id: 'desc' }
      });
    } catch (error: any) {
      console.error('ERROR_RAW_SQL_CREATE_MIEMBRO:', error);
      throw error;
    }
  }

  async removeMiembro(equipoId: number, userId: number) {
    return prisma.equipo_miembros.deleteMany({
      where: {
        equipo_id: BigInt(equipoId),
        user_id: BigInt(userId),
      },
    });
  }
}
