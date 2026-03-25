import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateCarreraInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *         clave:
 *           type: string
 *     UpdateCarreraInput:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *         clave:
 *           type: string
 */

export const createCarreraSchema = z.object({
  body: z.object({
    nombre: z.string().min(1, 'El nombre de la carrera es obligatorio'),
    clave: z.string().optional()
  })
});

export const updateCarreraSchema = z.object({
  body: z.object({
    nombre: z.string().min(1).optional(),
    clave: z.string().optional()
  })
});
