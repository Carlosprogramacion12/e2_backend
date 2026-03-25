import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     RegistroInicialInput:
 *       type: object
 *       required:
 *         - carrera_id
 *         - no_control
 *       properties:
 *         carrera_id:
 *           type: integer
 *         no_control:
 *           type: string
 *         telefono:
 *           type: string
 */

export const registroInicialSchema = z.object({
  body: z.object({
    carrera_id: z.number().int().positive('La carrera es requerida'),
    no_control: z.string().min(1, 'El No. de Control es requerido'),
    telefono: z.string().optional()
  })
});
