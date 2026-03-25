import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateCriterioInput:
 *       type: object
 *       required:
 *         - nombre
 *         - ponderacion
 *       properties:
 *         nombre:
 *           type: string
 *         ponderacion:
 *           type: number
 *           format: float
 *     UpdateCriterioInput:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *         ponderacion:
 *           type: number
 *           format: float
 */

export const createCriterioSchema = z.object({
  body: z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    ponderacion: z.number().min(0).max(100, 'La ponderación debe ser entre 0 y 100'),
  }),
});

export const updateCriterioSchema = z.object({
  body: z.object({
    nombre: z.string().min(1).optional(),
    ponderacion: z.number().min(0).max(100).optional(),
  }),
});
