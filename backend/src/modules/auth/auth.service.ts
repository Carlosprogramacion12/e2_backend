import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { LoginDto, RegisterDto, AuthResponse } from './auth.types';
import { config } from '../../config';
import prisma from '../../utils/prisma';

const authRepository = new AuthRepository();

// Get user roles from the users.role enum field OR legacy junction tables
async function getUserRoles(user: any): Promise<string[]> {
  const roles: string[] = [];

  try {
    // 1. Check legacy user_rol table first for existing users (Admins / Jueces usually seeded here)
    const legacyRolRows = await prisma.$queryRaw<Array<{ nombre: string }>>`
      SELECT r.nombre 
      FROM user_rol ur
      JOIN roles r ON ur.rol_id = r.id
      WHERE ur.user_id = ${user.id}
    `;
    if (legacyRolRows && legacyRolRows.length > 0) {
      legacyRolRows.forEach(r => {
        const name = r.nombre.toLowerCase();
        if (name === 'admin' || name === 'administrador') roles.push('Admin');
        else if (name === 'juez') roles.push('Juez');
        else if (name === 'participante') roles.push('Participante');
        else roles.push(r.nombre);
      });
    }
  } catch (err) {
    // Table might not exist, proceed
  }

  // 2. Check new users.role enum field if no legacy roles found or to complement
  if (user.role) {
    const role = user.role.toString().toUpperCase();
    if (role === 'ADMIN' && !roles.includes('Admin')) roles.push('Admin');
    else if (role === 'JUEZ' && !roles.includes('Juez')) roles.push('Juez');
    else if (role === 'PARTICIPANTE' && !roles.includes('Participante')) roles.push('Participante');
  }

  // Fallback: raw SQL in case the Prisma client has stale types and user.role was undefined in object
  if (roles.length === 0) {
    try {
      const rows = await prisma.$queryRaw<Array<{ role: string }>>`
        SELECT role FROM users WHERE id = ${user.id}
      `;
      if (rows.length > 0 && rows[0].role) {
        const role = rows[0].role.toUpperCase();
        if (role === 'ADMIN') roles.push('Admin');
        else if (role === 'JUEZ') roles.push('Juez');
        else if (role === 'PARTICIPANTE') roles.push('Participante');
      }
    } catch (err) {
      console.error('[getUserRoles] Error:', err);
    }
  }

  return roles.length > 0 ? roles : ['Participante'];
}

// Map role name to dashboard route
function getDashboardRoute(roles: string[]): string {
  if (roles.includes('Admin')) return '/admin/dashboard';
  if (roles.includes('Juez')) return '/juez/dashboard';
  if (roles.includes('Participante')) return '/participante/dashboard';
  return '/login';
}

export class AuthService {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const existingUser = await authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw { status: 400, message: 'El email ya está registrado' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await authRepository.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: 'PARTICIPANTE',
    });

    const token = jwt.sign({ id: Number(user.id) }, config.jwtSecret as jwt.Secret, { expiresIn: config.jwtExpiresIn as any });
    
    // Attempt to insert legacy role so Laravel app still sees them
    try {
      const rolParticipante = await prisma.$queryRaw<Array<{ id: number }>>`
        SELECT id FROM roles WHERE nombre = 'Participante' LIMIT 1
      `;
      if (rolParticipante.length > 0) {
        await prisma.$executeRaw`
          INSERT INTO user_rol (user_id, rol_id, created_at, updated_at) 
          VALUES (${Number(user.id)}, ${rolParticipante[0].id}, NOW(), NOW())
        `;
      }
    } catch (e) {
      // Ignore errors if table doesn't exist
    }

    const roles = await getUserRoles(user);
    const dashboardRoute = getDashboardRoute(roles);

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: Number(user.id),
          name: user.name,
          email: user.email,
          roles,
        },
        token,
        dashboardRoute,
      },
    };
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const user = await authRepository.findUserByEmail(data.email);
    if (!user) {
      throw { status: 401, message: 'Credenciales inválidas' };
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw { status: 401, message: 'Credenciales inválidas' };
    }

    const token = jwt.sign({ id: Number(user.id) }, config.jwtSecret as jwt.Secret, { expiresIn: config.jwtExpiresIn as any });
    const roles = await getUserRoles(user);
    const dashboardRoute = getDashboardRoute(roles);

    return {
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: Number(user.id),
          name: user.name,
          email: user.email,
          roles,
        },
        token,
        dashboardRoute,
      },
    };
  }

  async getMe(userId: number) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw { status: 404, message: 'Usuario no encontrado' };
    }

    const roles = await getUserRoles(user);

    return {
      success: true,
      data: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        roles,
        carrera: (user as any).carrera || null,
        no_control: (user as any).no_control || null,
        telefono: (user as any).telefono || null,
        created_at: user.created_at,
      },
    };
  }

  async updateProfile(userId: number, data: { name: string; email: string }) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw { status: 404, message: 'Usuario no encontrado' };
    }

    // Check if email is already taken by another user
    if (data.email && data.email !== user.email) {
      const existing = await authRepository.findUserByEmail(data.email);
      if (existing && Number(existing.id) !== userId) {
        throw { status: 400, message: 'El email ya está en uso por otro usuario' };
      }
    }

    const updated = await prisma.users.update({
      where: { id: BigInt(userId) },
      data: {
        name: data.name || user.name,
        email: data.email || user.email,
        updated_at: new Date(),
      },
    });

    const roles = await getUserRoles(updated);

    return {
      success: true,
      message: 'Perfil actualizado correctamente',
      data: {
        id: Number(updated.id),
        name: updated.name,
        email: updated.email,
        roles,
      },
    };
  }

  async updatePassword(userId: number, data: { current_password: string; password: string; password_confirmation: string }) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw { status: 404, message: 'Usuario no encontrado' };
    }

    // Validate current password
    const isValid = await bcrypt.compare(data.current_password, user.password);
    if (!isValid) {
      throw { status: 400, message: 'La contraseña actual es incorrecta' };
    }

    // Validate confirmation
    if (data.password !== data.password_confirmation) {
      throw { status: 400, message: 'Las contraseñas no coinciden' };
    }

    if (data.password.length < 8) {
      throw { status: 400, message: 'La contraseña debe tener al menos 8 caracteres' };
    }

    const hashed = await bcrypt.hash(data.password, 12);

    await prisma.users.update({
      where: { id: BigInt(userId) },
      data: {
        password: hashed,
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Contraseña actualizada correctamente',
    };
  }
}
