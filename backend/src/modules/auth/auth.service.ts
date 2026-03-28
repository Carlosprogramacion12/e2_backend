import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { LoginDto, RegisterDto, AuthResponse } from './auth.types';
import { config } from '../../config';
import prisma from '../../utils/prisma';

const authRepository = new AuthRepository();

// Get user roles from the users.role enum field OR legacy junction tables
async function getUserRoles(user: any): Promise<string[]> {
  try {
    // 1. Check legacy user_rol table first for existing users (Admins / Jueces usually seeded here)
    const legacyRolRows = await prisma.$queryRaw<Array<{ nombre: string }>>`
      SELECT r.nombre 
      FROM user_rol ur
      JOIN roles r ON ur.rol_id = r.id
      WHERE ur.user_id = ${user.id}
    `;
    if (legacyRolRows && legacyRolRows.length > 0) {
      return legacyRolRows.map(r => r.nombre);
    }
  } catch (err) {
    // Table might not exist, proceed
  }

  // 2. Check new users.role enum field
  if (user.role) {
    const role = user.role.toString();
    const roleMap: Record<string, string> = {
      'ADMIN': 'Admin', 'JUEZ': 'Juez', 'PARTICIPANTE': 'Participante',
      'Admin': 'Admin', 'Juez': 'Juez', 'Participante': 'Participante'
    };
    if (roleMap[role]) {
      return [roleMap[role]];
    }
  }

  // Fallback: raw SQL in case the Prisma client has stale types and user.role was undefined in object
  try {
    const rows = await prisma.$queryRaw<Array<{ role: string }>>`
      SELECT role FROM users WHERE id = ${user.id}
    `;
    if (rows.length > 0 && rows[0].role) {
      const roleMap: Record<string, string> = {
        'ADMIN': 'Admin', 'JUEZ': 'Juez', 'PARTICIPANTE': 'Participante'
      };
      if (roleMap[rows[0].role]) {
        return [roleMap[rows[0].role]];
      }
    }
  } catch (err) {
    console.error('[getUserRoles] Error:', err);
  }

  return ['Participante'];
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
      },
    };
  }
}
