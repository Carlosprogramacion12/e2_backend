import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { LoginDto, RegisterDto, AuthResponse } from './auth.types';
import { config } from '../../config';

const authRepository = new AuthRepository();

export class AuthService {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const existingUser = await authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw { status: 400, message: 'El email ya está registrado' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    // Create User
    const user = await authRepository.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    // Assign Role (Default: 3 = Participante)
    const rolId = data.rol_id || 3;
    await authRepository.assignRole(Number(user.id), rolId);

    // Create Participante profile if role is Participante
    const role = await authRepository.findRoleById(rolId);
    if (role && role.nombre === 'Participante') {
      await authRepository.createParticipante(Number(user.id));
    }

    const token = jwt.sign({ id: Number(user.id) }, config.jwtSecret as jwt.Secret, { expiresIn: config.jwtExpiresIn as any });
    const roles = role ? [role.nombre] : [];

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
    const roles = user.user_rol.map((ur) => ur.roles.nombre);

    let dashboardRoute = '/login';
    if (roles.includes('Admin')) dashboardRoute = '/admin/dashboard';
    else if (roles.includes('Juez')) dashboardRoute = '/juez/dashboard';
    else if (roles.includes('Participante')) dashboardRoute = '/participante/dashboard';

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

    const roles = user.user_rol.map((ur) => ur.roles.nombre);
    let participante: any = null;

    if (roles.includes('Participante')) {
      const p = await authRepository.findParticipanteByUserId(userId);
      if (p) {
        participante = {
          id: Number(p.id),
          carrera_id: p.carrera_id ? Number(p.carrera_id) : null,
          no_control: p.no_control,
          telefono: p.telefono,
        };
      }
    }

    return {
      success: true,
      data: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        roles,
        participante,
      },
    };
  }
}
