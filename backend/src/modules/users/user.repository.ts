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
      // New schema: role is an enum field on users
      const roleMap: Record<string, string> = {
        'Admin': 'ADMIN', 'Juez': 'JUEZ', 'Participante': 'PARTICIPANTE',
        'ADMIN': 'ADMIN', 'JUEZ': 'JUEZ', 'PARTICIPANTE': 'PARTICIPANTE'
      };
      where.role = roleMap[role] || role;
    }

    const [count, rows] = await Promise.all([
      prisma.users.count({ where }),
      prisma.users.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      })
    ]);

    return { count, rows };
  }

  async findById(id: number) {
    return prisma.users.findUnique({
      where: { id: BigInt(id) }
    });
  }

  async findByEmail(email: string) {
    return prisma.users.findUnique({ where: { email } });
  }

  async create(data: Omit<CreateUserDto, 'rol_id'> & { role?: string }) {
    return prisma.users.create({
      data: {
        name: data.nombre,
        email: data.email,
        password: data.password!,
        role: (data.role || 'PARTICIPANTE') as any,
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

  async setRole(userId: number, role: string) {
    const roleMap: Record<number, string> = {
      1: 'ADMIN', 2: 'JUEZ', 3: 'PARTICIPANTE'
    };
    const roleName = roleMap[Number(role)] || role;
    return prisma.users.update({
      where: { id: BigInt(userId) },
      data: { role: roleName as any }
    });
  }
}
