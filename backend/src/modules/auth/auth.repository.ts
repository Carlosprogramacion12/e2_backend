import prisma from '../../utils/prisma';
import { RegisterDto } from './auth.types';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.users.findUnique({
      where: { email },
      include: {
        user_rol: {
          include: {
            roles: true,
          },
        },
      },
    });
  }

  async findUserById(id: number) {
    return prisma.users.findUnique({
      where: { id: BigInt(id) },
      include: {
        user_rol: {
          include: {
            roles: true,
          },
        },
      },
    });
  }

  async findParticipanteByUserId(userId: number) {
    return prisma.participantes.findFirst({
      where: { user_id: BigInt(userId) },
      select: {
        id: true,
        carrera_id: true,
        no_control: true,
        telefono: true,
      },
    });
  }

  async createUser(data: Omit<RegisterDto, 'rol_id'>) {
    return prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async assignRole(userId: number, roleId: number) {
    return prisma.user_rol.create({
      data: {
        user_id: BigInt(userId),
        rol_id: BigInt(roleId),
      },
    });
  }

  async createParticipante(userId: number) {
    return prisma.participantes.create({
      data: {
        user_id: BigInt(userId),
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async findRoleById(roleId: number) {
    return prisma.roles.findUnique({
      where: { id: BigInt(roleId) },
    });
  }
}
