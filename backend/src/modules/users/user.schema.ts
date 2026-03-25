import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateUserInput:
 *       type: object
 *       required:
 *         - nombre
 *         - email
 *         - password
 *         - rol_id
 *       properties:
 *         nombre:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         rol_id:
 *           type: integer
 *     UpdateUserInput:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         rol_id:
 *           type: integer
 */

export const createUserSchema = z.object({
  body: z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    email: z.string().email('Debe ser un email válido'),
    password: z.string().min(6, 'Mínimo 6 caracteres para la contraseña'),
    rol_id: z.number().positive(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    nombre: z.string().optional(),
    email: z.string().email('Debe ser un email válido').optional(),
    password: z.string().min(6).optional(),
    rol_id: z.number().positive().optional(),
  }),
});
