import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     SavePreferencesInput:
 *       type: object
 *       properties:
 *         widgets:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - key
 *               - position
 *               - is_visible
 *             properties:
 *               key:
 *                 type: string
 *               position:
 *                 type: integer
 *               is_visible:
 *                 type: boolean
 *               settings:
 *                 type: object
 */

export const savePreferencesSchema = z.object({
  body: z.object({
    widgets: z.array(
      z.object({
        key: z.string().min(1),
        position: z.number().int().min(0),
        is_visible: z.boolean(),
        settings: z.any().optional(),
      })
    ).min(1, 'El arreglo de widgets no puede estar vacío'),
  }),
});
