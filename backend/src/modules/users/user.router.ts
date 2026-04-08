import { Router, Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { createUserSchema, updateUserSchema } from './user.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();
const userService = new UserService();

// Helper para Zod Validation
const validate = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({ body: req.body });
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * @openapi
 * /api/admin/usuarios:
 *   get:
 *     summary: Listar todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filtrar por rol (e.g. Participante, Juez)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de usuarios
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string;
    const role = req.query.role as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const evento_id = req.query.evento_id ? parseInt(req.query.evento_id as string, 10) : undefined;

    const result = await userService.getAllUsers({ search, role, page, limit, evento_id });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ─── EXPORTAR A EXCEL (igual que Laravel) ───
router.get('/exportar', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string;
    const role = req.query.role as string;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }
    if (role) {
      const roleMap: Record<string, string> = {
        'Admin': 'ADMIN', 'Juez': 'JUEZ', 'Participante': 'PARTICIPANTE',
        'ADMIN': 'ADMIN', 'JUEZ': 'JUEZ', 'PARTICIPANTE': 'PARTICIPANTE'
      };
      where.role = roleMap[role] || role;
    }

    // Fetch ALL users (no pagination for export)
    const prisma = (await import('../../utils/prisma')).default;
    const usuarios = await prisma.users.findMany({
      where,
      orderBy: { created_at: 'desc' }
    });

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Usuarios');

    // Laravel-matching columns: ID, Nombre, Email, Rol(es), Email Verificado, Fecha de Registro, No. Control, Carrera, Teléfono
    sheet.columns = [
      { header: 'ID',                key: 'id',               width: 8  },
      { header: 'Nombre',            key: 'nombre',           width: 30 },
      { header: 'Email',             key: 'email',            width: 35 },
      { header: 'Rol(es)',           key: 'roles',            width: 18 },
      { header: 'Email Verificado',  key: 'email_verificado', width: 18 },
      { header: 'Fecha de Registro', key: 'fecha_registro',   width: 22 },
      { header: 'No. Control',       key: 'no_control',       width: 16 },
      { header: 'Carrera',           key: 'carrera',          width: 30 },
      { header: 'Teléfono',          key: 'telefono',         width: 16 },
    ];

    // Header row styling (indigo background, white bold text) — matching Laravel
    const headerRow = sheet.getRow(1);
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }  // Indigo-600
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 28;

    // Role mapping
    const ROLE_NAME_MAP: Record<string, string> = {
      'ADMIN': 'Admin', 'JUEZ': 'Juez', 'PARTICIPANTE': 'Participante'
    };

    // Add data rows
    for (const u of usuarios) {
      const roleName = ROLE_NAME_MAP[(u as any).role] || 'Participante';
      sheet.addRow({
        id: Number(u.id),
        nombre: u.name,
        email: u.email,
        roles: roleName,
        email_verificado: 'No',  // No email verification in new system
        fecha_registro: u.created_at
          ? new Date(u.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
            new Date(u.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
          : '-',
        no_control: (u as any).no_control || 'N/A',
        carrera: (u as any).carrera || 'N/A',
        telefono: (u as any).telefono || 'N/A',
      });
    }

    // Auto-fit and add borders to data rows
    sheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle' };
      }
      row.eachCell((cell: any) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };
      });
    });

    // Send response
    const now = new Date();
    const filename = `usuarios_${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/usuarios:
 *   post:
 *     summary: Crear un nuevo usuario (Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error de validación o email duplicado
 */
router.post('/', authMiddleware, validate(createUserSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.createUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos completos del usuario
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await userService.getUserById(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario existente
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserInput'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put('/:id', authMiddleware, validate(updateUserSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await userService.updateUser(id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/admin/usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await userService.deleteUser(id, Number(req.user.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const userRouter = router;
