import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado. Por favor, inicia sesión.' });
    }

    const userRole = req.user.role; // Prisma devuelve 'ADMIN', 'JUEZ', 'PARTICIPANTE'
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Acceso denegado. Este endpoint requiere uno de los siguientes roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};
