import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateEventoInput:
 *       type: object
 *       required:
 *         - nombre
 *         - fecha_inicio
 *         - fecha_fin
 *       properties:
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         fecha_inicio:
 *           type: string
 *           format: date-time
 *         fecha_fin:
 *           type: string
 *           format: date-time
 *         jueces:
 *           type: array
 *           items:
 *             type: integer
 *     UpdateEventoInput:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         fecha_inicio:
 *           type: string
 *           format: date-time
 *         fecha_fin:
 *           type: string
 *           format: date-time
 *         jueces:
 *           type: array
 *           items:
 *             type: integer
 */

export const createEventoSchema = z.object({
  body: z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    descripcion: z.string().optional(),
    fecha_inicio: z.string().datetime({ message: 'Debe ser una fecha ISO válida' }),
    fecha_fin: z.string().datetime({ message: 'Debe ser una fecha ISO válida' }),
    jueces: z.array(z.number()).optional(),
  }),
});

export const updateEventoSchema = z.object({
  body: z.object({
    nombre: z.string().min(1).optional(),
    descripcion: z.string().optional(),
    fecha_inicio: z.string().datetime().optional(),
    fecha_fin: z.string().datetime().optional(),
    jueces: z.array(z.number()).optional(),
  }),
});
