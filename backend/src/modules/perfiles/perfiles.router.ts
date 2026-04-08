import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../utils/prisma';

const router = Router();

// GET all perfiles
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawPerfiles = await prisma.$queryRaw`SELECT * FROM perfiles WHERE deleted_at IS NULL ORDER BY created_at DESC`;

    const serialized = (rawPerfiles as any[]).map((p: any) => ({
      ...p,
      id: Number(p.id)
    }));

    res.json({ data: serialized });
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
