/**
 * Middleware de verificación de rol
 * Equivalente al middleware 'role:Admin' de Laravel
 * 
 * Uso: role('Admin'), role('Juez'), role('Participante')
 */
const role = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }

    const userRoles = req.user.roles.map(r => r.nombre);
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Se requiere uno de los roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = role;
