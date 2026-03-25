import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     StoreAvanceInput:
 *       type: object
 *       required:
 *         - descripcion
 *         - fecha
 *       properties:
 *         descripcion:
 *           type: string
 *         fecha:
 *           type: string
 *           format: date
 */

export const storeAvanceSchema = z.object({
  body: z.object({
    descripcion: z.string().min(1, 'La descripción es requerida'),
    fecha: z.string().min(1, 'La fecha es requerida')
  })
});
