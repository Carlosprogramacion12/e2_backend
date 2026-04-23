import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../prisma.config';

const router = Router();

// GET all perfiles (paginated)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;

    let rawPerfiles;
    let totalCountResult: any[];

    if (search) {
      rawPerfiles = await prisma.$queryRaw`
        SELECT * FROM perfiles 
        WHERE deleted_at IS NULL 
        AND nombre LIKE ${search}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      totalCountResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM perfiles 
        WHERE deleted_at IS NULL 
        AND nombre LIKE ${search}
      `;
    } else {
      rawPerfiles = await prisma.$queryRaw`
        SELECT * FROM perfiles 
        WHERE deleted_at IS NULL 
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      totalCountResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM perfiles WHERE deleted_at IS NULL
      `;
    }

    const total = Number(totalCountResult[0].count);

    const serialized = (rawPerfiles as any[]).map((p: any) => ({
      ...p,
      id: Number(p.id)
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

// GET single perfil by id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.$queryRaw`SELECT * FROM perfiles WHERE id = ${id} AND deleted_at IS NULL`;
    const perfil = (result as any[])[0];
    if (!perfil) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    res.json({ data: { ...perfil, id: Number(perfil.id) } });
  } catch (error) {
    next(error);
  }
});

// POST a new perfil
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre } = req.body;
    await prisma.$executeRaw`INSERT INTO perfiles (nombre, created_at, updated_at) VALUES (${nombre}, NOW(), NOW())`;
    res.status(201).json({ message: 'Perfil creado exitosamente' });
  } catch (error) {
    next(error);
  }
});

// PUT update a perfil
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { nombre } = req.body;
    await prisma.$executeRaw`UPDATE perfiles SET nombre = ${nombre}, updated_at = NOW() WHERE id = ${id}`;
    res.json({ message: 'Perfil actualizado exitosamente' });
  } catch (error) {
    next(error);
  }
});

// DELETE a perfil (soft delete)
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await prisma.$executeRaw`UPDATE perfiles SET deleted_at = NOW(), updated_at = NOW() WHERE id = ${id}`;
    res.json({ message: 'Perfil eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
});

export const perfilesRouter = router;
