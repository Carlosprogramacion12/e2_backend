import prisma from '../../utils/prisma';
import { RegisterDto } from './auth.types';

export class AuthRepository {
  async findUserByEmail(email: string) {
    try {
      // Try new schema first (direct role field)
      const user = await prisma.users.findUnique({
        where: { email },
      });
      return user;
    } catch {
      return null;
    }
  }

  async findUserById(id: number) {
    try {
      return await prisma.users.findUnique({
        where: { id: BigInt(id) },
      });
    } catch {
      return null;
    }
  }

  async createUser(data: Omit<RegisterDto, 'rol_id'> & { role?: string }) {
    return prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        ...(data.role ? { role: data.role as any } : {}),
      } as any,
    });
  }

  async assignRole(userId: number, role: string) {
    try {
      return await prisma.users.update({
        where: { id: BigInt(userId) },
        data: { role } as any,
      });
    } catch {
      return null;
    }
  }
}


