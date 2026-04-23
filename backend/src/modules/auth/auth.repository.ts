import prisma from '../../prisma.config';
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
        role: (data.role as any) || 'PARTICIPANTE',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async assignRole(userId: number, role: string) {
    try {
      return await prisma.users.update({
        where: { id: BigInt(userId) },
        data: { role, updated_at: new Date() } as any,
      });
    } catch {
      return null;
    }
  }
}


