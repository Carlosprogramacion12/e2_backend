/**
 * Controlador CRUD de Usuarios
 * Equivalente a Admin\UsuarioController
 */
const bcrypt = require('bcryptjs');
const { User, Rol, Participante } = require('../models');
const { Op } = require('sequelize');

// GET /api/admin/usuarios
exports.index = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const where = {};
    const include = [{ model: Rol, as: 'roles', through: { attributes: [] } }];

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    if (role) {
      include[0].where = { nombre: role };
      include[0].required = true;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await User.findAndCountAll({
      where,
      include,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    const roles = await Rol.findAll();

    res.json({
      success: true,
      data: {
        usuarios: rows.map(u => ({
          id: u.id, name: u.name, email: u.email, created_at: u.created_at,
          roles: u.roles.map(r => ({ id: r.id, nombre: r.nombre }))
        })),
        roles,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({ success: false, message: 'Error al listar usuarios' });
  }
};

// POST /api/admin/usuarios
exports.store = async (req, res) => {
  try {
    const { nombre, email, password, rol_id } = req.body;

    if (!nombre || !email || !password || !rol_id) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name: nombre, email, password: hashedPassword });
    
    // Asignar rol
    await user.addRole(rol_id);

    // Si es participante, crear registro
    const rol = await Rol.findByPk(rol_id);
    if (rol && rol.nombre === 'Participante') {
      await Participante.create({ user_id: user.id });
    }

    res.status(201).json({ success: true, message: 'Usuario creado y rol asignado correctamente.' });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ success: false, message: 'Error al crear usuario' });
  }
};

// GET /api/admin/usuarios/:id
exports.show = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Rol, as: 'roles', through: { attributes: [] } }],
      attributes: { exclude: ['password', 'remember_token'] }
    });

    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const roles = await Rol.findAll();
    res.json({ success: true, data: { usuario: user, roles } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener usuario' });
  }
};

// PUT /api/admin/usuarios/:id
exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const { nombre, email, password, rol_id } = req.body;
    const data = { name: nombre, email };
    if (password) {
      data.password = await bcrypt.hash(password, 12);
    }

    await user.update(data);

    if (rol_id) {
      await user.setRoles([rol_id]);
    }

    res.json({ success: true, message: 'Usuario actualizado correctamente.' });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
  }
};

// DELETE /api/admin/usuarios/:id
exports.destroy = async (req, res) => {
  try {
    if (req.user.id == req.params.id) {
      return res.status(400).json({ success: false, message: 'No puedes eliminar tu propia cuenta.' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    await user.destroy();
    res.json({ success: true, message: 'Usuario eliminado del sistema.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
  }
};
