import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     CreatePerfilInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *     UpdatePerfilInput:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 */

export const createPerfilSchema = z.object({
  body: z.object({
    nombre: z.string().min(1, 'El nombre del perfil es obligatorio')
  })
});

export const updatePerfilSchema = z.object({
  body: z.object({
    nombre: z.string().min(1).optional()
  })
});
