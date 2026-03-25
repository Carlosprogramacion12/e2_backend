import prisma from '../../utils/prisma';
import { CreateUserDto, UpdateUserDto, UserQueryOptions } from './user.types';

export class UserRepository {
  async findAllPaginated(options: UserQueryOptions) {
    const { search, role, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    if (role) {
      where.user_rol = {
        some: {
          roles: {
            nombre: role
          }
        }
      };
    }

    const [count, rows] = await Promise.all([
      prisma.users.count({ where }),
      prisma.users.findMany({
        where,
        include: {
          user_rol: {
            include: { roles: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      })
    ]);

    return { count, rows };
  }

  async findById(id: number) {
    return prisma.users.findUnique({
      where: { id: BigInt(id) },
      include: {
        user_rol: {
          include: { roles: true }
        }
      }
    });
  }

  async findByEmail(email: string) {
    return prisma.users.findUnique({ where: { email } });
  }

  async create(data: Omit<CreateUserDto, 'rol_id'>) {
    return prisma.users.create({
      data: {
        name: data.nombre,
        email: data.email,
        password: data.password!,
        created_at: new Date(),
        updated_at: new Date(),
      }
    });
  }

  async update(id: number, data: Omit<UpdateUserDto, 'rol_id'>) {
    const updateData: any = { updated_at: new Date() };
    if (data.nombre) updateData.name = data.nombre;
    if (data.email) updateData.email = data.email;
    if (data.password) updateData.password = data.password;

    return prisma.users.update({
      where: { id: BigInt(id) },
      data: updateData
    });
  }

  async delete(id: number) {
    return prisma.users.delete({ where: { id: BigInt(id) } });
  }

  async assignRole(userId: number, roleId: number) {
    return prisma.user_rol.create({
      data: {
        user_id: BigInt(userId),
        rol_id: BigInt(roleId)
      }
    });
  }

  async setRoles(userId: number, roleId: number) {
    await prisma.user_rol.deleteMany({ where: { user_id: BigInt(userId) } });
    return this.assignRole(userId, roleId);
  }

  async createParticipanteProfile(userId: number) {
    return prisma.participantes.create({
      data: {
        user_id: BigInt(userId),
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }
}
