import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     CrearInvitacionInput:
 *       type: object
 *       required:
 *         - participante_id
 *       properties:
 *         participante_id:
 *           type: integer
 *         perfil_sugerido_id:
 *           type: integer
 *         mensaje:
 *           type: string
 */

export const crearInvitacionSchema = z.object({
  body: z.object({
    participante_id: z.number().int().positive('El ID del participante es requerido'),
    perfil_sugerido_id: z.number().int().positive().optional(),
    mensaje: z.string().optional()
  })
});
