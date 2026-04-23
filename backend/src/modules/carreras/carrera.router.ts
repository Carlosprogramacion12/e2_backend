import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../prisma.config';

const router = Router();

// GET all carreras (paginated)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;

    let rawCarreras;
    let totalCountResult: any[];

    if (search) {
      rawCarreras = await prisma.$queryRaw`
        SELECT * FROM carreras 
        WHERE deleted_at IS NULL 
        AND (nombre LIKE ${search} OR clave LIKE ${search})
        ORDER BY nombre ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      totalCountResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM carreras 
        WHERE deleted_at IS NULL 
        AND (nombre LIKE ${search} OR clave LIKE ${search})
      `;
    } else {
      rawCarreras = await prisma.$queryRaw`
        SELECT * FROM carreras 
        WHERE deleted_at IS NULL 
        ORDER BY nombre ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      totalCountResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM carreras WHERE deleted_at IS NULL
      `;
    }

    const total = Number(totalCountResult[0].count);
    
    // Count participantes from users table
    const usersCounts = await prisma.$queryRaw`SELECT carrera, COUNT(id) as count FROM users WHERE role = 'PARTICIPANTE' AND carrera IS NOT NULL GROUP BY carrera`;
    
    const countMap = new Map();
    (usersCounts as any[]).forEach(u => countMap.set(u.carrera, Number(u.count)));

    const serialized = (rawCarreras as any[]).map((c: any) => ({
      ...c,
      id: Number(c.id),
      participantes_count: countMap.get(c.nombre) || 0
    }));

    res.json({ 
      data: serialized,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET single carrera by id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.$queryRaw`SELECT * FROM carreras WHERE id = ${id} AND deleted_at IS NULL`;
    const carrera = (result as any[])[0];
    if (!carrera) {
      return res.status(404).json({ error: 'Carrera no encontrada' });
    }
    res.json({ data: { ...carrera, id: Number(carrera.id) } });
  } catch (error) {
    next(error);
  }
});

// POST a new carrera
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, clave } = req.body;
    await prisma.$executeRaw`INSERT INTO carreras (nombre, clave, created_at, updated_at) VALUES (${nombre}, ${clave || null}, NOW(), NOW())`;
    res.status(201).json({ message: 'Carrera creada exitosamente' });
  } catch (error) {
    next(error);
  }
});

// PUT update a carrera
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { nombre, clave } = req.body;
    await prisma.$executeRaw`UPDATE carreras SET nombre = ${nombre}, clave = ${clave || null}, updated_at = NOW() WHERE id = ${id}`;
    res.json({ message: 'Carrera actualizada exitosamente' });
  } catch (error) {
    next(error);
  }
});

// DELETE a carrera (soft delete)
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await prisma.$executeRaw`UPDATE carreras SET deleted_at = NOW(), updated_at = NOW() WHERE id = ${id}`;
    res.json({ message: 'Carrera eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
});

export const carreraRouter = router;
