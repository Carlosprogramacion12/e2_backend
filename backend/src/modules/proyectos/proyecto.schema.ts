import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateProyectoInput:
 *       type: object
 *       required:
 *         - equipo_id
 *         - evento_id
 *         - nombre
 *       properties:
 *         equipo_id:
 *           type: integer
 *         evento_id:
 *           type: integer
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         repositorio_url:
 *           type: string
 *           format: uri
 *     UpdateProyectoInput:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         repositorio_url:
 *           type: string
 *           format: uri
 */

export const createProyectoSchema = z.object({
  body: z.object({
    equipo_id: z.number().positive(),
    evento_id: z.number().positive(),
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    descripcion: z.string().optional(),
    repositorio_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  }),
});

export const updateProyectoSchema = z.object({
  body: z.object({
    nombre: z.string().min(1).optional(),
    descripcion: z.string().optional(),
    repositorio_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  }),
});
