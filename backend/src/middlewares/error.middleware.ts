import { Application, Request, Response, NextFunction } from 'express';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]:', err);
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  // Return validation error format for Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }

  res.status(status).json({
    success: false,
    message
  });
};
