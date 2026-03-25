import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateEquipoInput:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *         max_programadores:
 *           type: integer
 *         max_disenadores:
 *           type: integer
 *         max_testers:
 *           type: integer
 *     AddMiembroInput:
 *       type: object
 *       required:
 *         - participante_id
 *         - perfil_id
 *       properties:
 *         participante_id:
 *           type: integer
 *         perfil_id:
 *           type: integer
 */

export const updateEquipoSchema = z.object({
  body: z.object({
    nombre: z.string().min(1).optional(),
    max_programadores: z.number().int().min(0).optional(),
    max_disenadores: z.number().int().min(0).optional(),
    max_testers: z.number().int().min(0).optional(),
  }),
});

export const addMiembroSchema = z.object({
  body: z.object({
    participante_id: z.number().positive('El id del participante es requerido y debe ser positivo'),
    perfil_id: z.number().positive('El id del perfil es requerido y debe ser positivo'),
  }),
});
