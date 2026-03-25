import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     CrearSolicitudInput:
 *       type: object
 *       properties:
 *         mensaje:
 *           type: string
 *         perfil_solicitado_id:
 *           type: integer
 */

export const crearSolicitudSchema = z.object({
  body: z.object({
    mensaje: z.string().optional(),
    perfil_solicitado_id: z.number().int().positive().optional()
  })
});
