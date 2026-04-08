import bcrypt from 'bcryptjs';
import { UserRepository } from './user.repository';
import { CreateUserDto, UpdateUserDto, UserQueryOptions } from './user.types';

const userRepository = new UserRepository();

// Available roles for the frontend dropdown
const AVAILABLE_ROLES = [
  { id: 1, nombre: 'Admin' },
  { id: 2, nombre: 'Juez' },
  { id: 3, nombre: 'Participante' }
];

const ROLE_ID_MAP: Record<number, string> = {
  1: 'ADMIN', 2: 'JUEZ', 3: 'PARTICIPANTE'
};

const ROLE_NAME_MAP: Record<string, string> = {
  'ADMIN': 'Admin', 'JUEZ': 'Juez', 'PARTICIPANTE': 'Participante'
};

export class UserService {
  async getAllUsers(options: UserQueryOptions) {
    const { count, rows } = await userRepository.findAllPaginated(options);
    const limit = options.limit || 10;
    const page = options.page || 1;

    let occupiedUserIds: Set<number> = new Set();
    
    if (options.evento_id) {
      const prisma = (await import('../../utils/prisma')).default;
      console.log('DEBUG: Buscando ocupados para evento:', options.evento_id);
      try {
        const occupied: any[] = await prisma.$queryRaw`
          SELECT DISTINCT em.user_id 
          FROM equipo_miembros em
          JOIN proyectos p ON p.equipo_id = em.equipo_id
          WHERE p.evento_id = ${BigInt(options.evento_id)}
        `;
        console.log('DEBUG: Ocupados encontrados:', occupied.length);
        occupiedUserIds = new Set(occupied.map(o => Number(o.user_id)));
      } catch (sqlError) {
        console.error('DEBUG: Error SQL Occupied:', sqlError);
      }
    }

    return {
      success: true,
      data: {
        usuarios: rows.map((u: any) => ({
          id: Number(u.id),
          name: u.name,
          email: u.email,
          created_at: u.created_at,
          esta_ocupado: occupiedUserIds.has(Number(u.id)),
          roles: [{
            id: Object.entries(ROLE_ID_MAP).find(([_, v]) => v === u.role)?.[0] || 3,
            nombre: ROLE_NAME_MAP[u.role] || 'Participante'
          }]
        })),
        roles: AVAILABLE_ROLES,
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
    const role = ROLE_ID_MAP[data.rol_id] || 'PARTICIPANTE';
    
    await userRepository.create({
      ...data,
      password: hashedPassword,
      role
    });

    return { success: true, message: 'Usuario creado y rol asignado correctamente.' };
  }

  async getUserById(id: number) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw { status: 404, message: 'Usuario no encontrado' };
    }

    return {
      success: true,
      data: {
        usuario: {
          id: Number(user.id),
          name: user.name,
          email: user.email,
          created_at: user.created_at,
          roles: [{
            id: Object.entries(ROLE_ID_MAP).find(([_, v]) => v === (user as any).role)?.[0] || 3,
            nombre: ROLE_NAME_MAP[(user as any).role] || 'Participante'
          }]
        },
        roles: AVAILABLE_ROLES
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
      password: hashedPassword,
      telefono: data.telefono,
      no_control: data.no_control,
      carrera: data.carrera
    });

    if (data.rol_id) {
      const role = ROLE_ID_MAP[data.rol_id] || 'PARTICIPANTE';
      await userRepository.setRole(id, role);
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
