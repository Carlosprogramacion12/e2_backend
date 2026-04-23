import bcrypt from 'bcryptjs';
import { UserRepository } from './user.repository';
import { CreateUserDto, UpdateUserDto, UserQueryOptions } from './user.types';
import { AppError } from '../errors';




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
  constructor(private readonly userRepository: UserRepository = new UserRepository()) {}

  async getAllUsers(options: UserQueryOptions) {
    const { count, rows } = await this.userRepository.findAllPaginated(options);
    const limit = options.limit || 10;
    const page = options.page || 1;

    let occupiedUserIds: Set<number> = new Set();
    
    if (options.evento_id) {
      const prisma = (await import('../prisma.config')).default;
      try {
        const occupied: any[] = await prisma.$queryRaw`
          SELECT DISTINCT em.user_id 
          FROM equipo_miembros em
          JOIN proyectos p ON p.equipo_id = em.equipo_id
          WHERE p.evento_id = ${BigInt(options.evento_id)}
        `;
        occupiedUserIds = new Set(occupied.map(o => Number(o.user_id)));
      } catch (sqlError) {
        // Error handled silently
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
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError(400, 'El email ya está registrado');
    }

    if (data.nombre) {
      const existingName = await this.userRepository.findByName(data.nombre);
      if (existingName) throw new AppError(400, 'El nombre de usuario ya está registrado');
    }

    if (data.telefono) {
      const existingPhone = await this.userRepository.findByPhone(data.telefono);
      if (existingPhone) throw new AppError(400, 'El número de teléfono ya está registrado');
    }

    if (data.no_control) {
      const existingControl = await this.userRepository.findByControlNumber(data.no_control);
      if (existingControl) throw new AppError(400, 'El número de control ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password!, 12);
    const role = ROLE_ID_MAP[data.rol_id] || 'PARTICIPANTE';
    
    await this.userRepository.create({
      ...data,
      password: hashedPassword,
      role
    });

    return { success: true, message: 'Usuario creado y rol asignado correctamente.' };
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
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

  async updateUser(id: number, data: UpdateUserDto, requesterId?: number) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError(404, 'Usuario no encontrado');

    // Uniqueness checks
    if (data.email && data.email !== user.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing) throw new AppError(400, 'El email ya está en uso');
    }

    if (data.nombre && data.nombre !== user.name) {
      const existing = await this.userRepository.findByName(data.nombre);
      if (existing) throw new AppError(400, 'El nombre ya está en uso');
    }

    if (data.telefono && data.telefono !== user.telefono) {
      const existing = await this.userRepository.findByPhone(data.telefono);
      if (existing) throw new AppError(400, 'El teléfono ya está en uso');
    }

    if (data.no_control && data.no_control !== user.no_control) {
      const existing = await this.userRepository.findByControlNumber(data.no_control);
      if (existing) throw new AppError(400, 'El número de control ya está en uso');
    }

    let hashedPassword = data.password;
    if (hashedPassword) {
      hashedPassword = await bcrypt.hash(hashedPassword, 12);
    }

    await this.userRepository.update(id, {
      nombre: data.nombre,
      email: data.email,
      password: hashedPassword,
      telefono: data.telefono,
      no_control: data.no_control,
      carrera: data.carrera
    });

    if (data.rol_id) {
      // Security check: Don't allow changing own role to prevent self-lockout
      if (requesterId && id === Number(requesterId)) {
        // We skip role update for self, but update other fields
      } else {
        const role = ROLE_ID_MAP[data.rol_id] || 'PARTICIPANTE';
        await this.userRepository.setRole(id, role);
      }
    }

    return { success: true, message: 'Usuario actualizado correctamente.' };
  }

  async deleteUser(id: number, requestUserId: number) {
    if (id === requestUserId) {
      throw new AppError(400, 'No puedes eliminar tu propia cuenta.');
    }

    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError(404, 'Usuario no encontrado');

    await this.userRepository.delete(id);
    return { success: true, message: 'Usuario eliminado del sistema.' };
  }
}
