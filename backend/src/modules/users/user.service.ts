import bcrypt from 'bcryptjs';
import { UserRepository } from './user.repository';
import { CreateUserDto, UpdateUserDto, UserQueryOptions } from './user.types';
import prisma from '../../utils/prisma';

const userRepository = new UserRepository();

export class UserService {
  async getAllUsers(options: UserQueryOptions) {
    const { count, rows } = await userRepository.findAllPaginated(options);
    const roles = await prisma.roles.findMany();

    const limit = options.limit || 10;
    const page = options.page || 1;

    return {
      success: true,
      data: {
        usuarios: rows.map((u) => ({
          id: Number(u.id),
          name: u.name,
          email: u.email,
          created_at: u.created_at,
          roles: u.user_rol.map((ur) => ({
            id: Number(ur.roles.id),
            nombre: ur.roles.nombre
          }))
        })),
        roles: roles.map((r) => ({ id: Number(r.id), nombre: r.nombre })),
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    };
  }

  async createUser(data: CreateUserDto) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw { status: 400, message: 'El email ya está registrado' };
    }

    const hashedPassword = await bcrypt.hash(data.password!, 12);
    
    // Default config values and insert user
    const user = await userRepository.create({
      ...data,
      password: hashedPassword
    });

    await userRepository.assignRole(Number(user.id), data.rol_id);

    // If role is Participante (ID: 3 usually, check by DB name to be safe)
    const role = await prisma.roles.findUnique({ where: { id: BigInt(data.rol_id) } });
    if (role && role.nombre === 'Participante') {
      await userRepository.createParticipanteProfile(Number(user.id));
    }

    return { success: true, message: 'Usuario creado y rol asignado correctamente.' };
  }

  async getUserById(id: number) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw { status: 404, message: 'Usuario no encontrado' };
    }

    const roles = await prisma.roles.findMany();
    return {
      success: true,
      data: {
        usuario: {
          id: Number(user.id),
          name: user.name,
          email: user.email,
          created_at: user.created_at,
          roles: user.user_rol.map((ur) => ({ id: Number(ur.roles.id), nombre: ur.roles.nombre }))
        },
        roles: roles.map((r) => ({ id: Number(r.id), nombre: r.nombre }))
      }
    };
  }

  async updateUser(id: number, data: UpdateUserDto) {
    const user = await userRepository.findById(id);
    if (!user) throw { status: 404, message: 'Usuario no encontrado' };

    let hashedPassword = data.password;
    if (hashedPassword) {
      hashedPassword = await bcrypt.hash(hashedPassword, 12);
    }

    await userRepository.update(id, {
      nombre: data.nombre,
      email: data.email,
      password: hashedPassword
    });

    if (data.rol_id) {
      await userRepository.setRoles(id, data.rol_id);
    }

    return { success: true, message: 'Usuario actualizado correctamente.' };
  }

  async deleteUser(id: number, requestUserId: number) {
    if (id === requestUserId) {
      throw { status: 400, message: 'No puedes eliminar tu propia cuenta.' };
    }

    const user = await userRepository.findById(id);
    if (!user) throw { status: 404, message: 'Usuario no encontrado' };

    await userRepository.delete(id);
    return { success: true, message: 'Usuario eliminado del sistema.' };
  }
}
