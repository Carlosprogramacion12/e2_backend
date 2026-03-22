/**
 * Controlador de Autenticación
 * Equivalente a AuthenticatedSessionController + RegisteredUserController
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Rol, Participante } = require('../models');

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, rol_id } = req.body;

    // Validaciones
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nombre, email y contraseña son requeridos' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });

    // Asignar rol (por defecto Participante = 3)
    const rolId = rol_id || 3;
    await user.addRole(rolId);

    // Si es participante, crear registro en participantes
    const rol = await Rol.findByPk(rolId);
    if (rol && rol.nombre === 'Participante') {
      await Participante.create({ user_id: user.id });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    const roles = await user.getRoles({ through: { attributes: [] } });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: { id: user.id, name: user.name, email: user.email, roles: roles.map(r => r.nombre) },
        token
      }
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ success: false, message: 'Error al registrar usuario' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  console.log('--- LOGIN ATTEMPT ---');
  console.log('Body:', req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }

    const user = await User.findOne({
      where: { email },
      include: [{ model: Rol, as: 'roles', through: { attributes: [] } }]
    });

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    console.log('User found:', user.id, user.email);

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    console.log('Password valid');

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    // Determinar dashboard route según rol (como getDashboardRouteName)
    const roleNames = user.roles.map(r => r.nombre);
    console.log('Roles:', roleNames);
    let dashboardRoute = '/login';
    if (roleNames.includes('Admin')) dashboardRoute = '/admin/dashboard';
    else if (roleNames.includes('Juez')) dashboardRoute = '/juez/dashboard';
    else if (roleNames.includes('Participante')) dashboardRoute = '/participante/dashboard';

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: { id: user.id, name: user.name, email: user.email, roles: roleNames },
        token,
        dashboardRoute
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error en el login' });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const user = req.user;
    const roleNames = user.roles.map(r => r.nombre);

    let participante = null;
    if (roleNames.includes('Participante')) {
      participante = await Participante.findOne({
        where: { user_id: user.id },
        attributes: ['id', 'carrera_id', 'no_control', 'telefono']
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: roleNames,
        participante
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener datos del usuario' });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  // JWT es stateless, el logout se maneja eliminando el token en el frontend
  res.json({ success: true, message: 'Sesión cerrada (eliminar token en cliente)' });
};
