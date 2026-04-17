import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';
import prisma from '../../utils/prisma';
import { ConstanciaService } from '../constancias/constancias.service';
import { PdfService } from '../../utils/pdf.service';
import { RankingService } from '../resultados/ranking.service';
import path from 'path';

const constanciaService = new ConstanciaService();
const rankingService = new RankingService();

const router = Router();

/**
 * @swagger
 * /api/participante/dashboard:
 *   get:
 *     summary: Obtener datos del dashboard del participante
 *     tags: [Participante]
 *     security:
 *       - bearerAuth: []
 */
router.get('/dashboard', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    // 1. Get user info (carrera etc)
    const user = await prisma.users.findUnique({ where: { id: BigInt(userId) } });
    const registrado = !!(user?.carrera && user?.no_control && user?.telefono);

    let equipo: any = null;
    let proyecto: any = null;
    let miembros: any[] = [];
    let puntajeTotal = 0;
    let chartLabels: string[] = [];
    let chartData: number[] = [];
    let evento_inscrito: any = null;
    let constancias: any = { individual: false, equipo: false };
    let invitaciones: any[] = [];
    let comentarios: any[] = [];

    // 2. Find ALL memberships for multi-event support
    const memberships = await prisma.equipo_miembros.findMany({
      where: { user_id: BigInt(userId) },
      include: { 
        equipos: { 
          include: { 
            proyectos: { include: { eventos: true } } 
          } 
        } 
      }
    });

    // Extract all participations (project + event + team)
    const participaciones: any[] = [];
    memberships.forEach(m => {
      m.equipos.proyectos.forEach(p => {
        participaciones.push({
          proyecto_id: Number(p.id),
          equipo_id: Number(m.equipos.id),
          equipo_nombre: m.equipos.nombre,
          proyecto_nombre: p.nombre,
          evento_id: Number(p.evento_id),
          evento_nombre: p.eventos?.nombre || 'Evento Desconocido',
          fecha_inicio: p.eventos?.fecha_inicio,
          fecha_fin: p.eventos?.fecha_fin
        });
      });
    });

    // 2.5 Fetch user preferences for sticky selection
    const pref = await prisma.user_preferences.findUnique({ where: { user_id: BigInt(userId as string) } });
    let lastViewedId: bigint | null = null;
    if (pref && pref.settings) {
      try {
        const settings = JSON.parse(pref.settings);
        if (settings.last_evento_id) lastViewedId = BigInt(settings.last_evento_id);
      } catch (e) {}
    }

    // Determine the active context
    const proyectoIdReq = req.query.proyectoId ? BigInt(req.query.proyectoId as string) : null;
    const eventoIdReq = req.query.eventoId ? BigInt(req.query.eventoId as string) : null;
    let activeMembership: any = null;
    let activeProyectoData: any = null;

    if (proyectoIdReq) {
      // Find the membership for this specific project
      activeMembership = memberships.find(m => 
        m.equipos.proyectos.some(p => p.id === proyectoIdReq)
      );
      if (activeMembership) {
        activeProyectoData = activeMembership.equipos.proyectos.find(p => p.id === proyectoIdReq);
      }
    } else if (eventoIdReq) {
      // Try to find if user is already in this event
      activeMembership = memberships.find(m => 
        m.equipos.proyectos.some(p => p.evento_id === eventoIdReq)
      );
      if (activeMembership) {
        activeProyectoData = activeMembership.equipos.proyectos.find(p => p.evento_id === eventoIdReq);
      } else {
        // Just fetch the event info for the "No Team" view
        const eventInfo = await prisma.eventos.findUnique({ 
          where: { id: eventoIdReq },
          include: { 
            _count: { select: { evento_jueces: true } },
            evaluacion_criterios: { select: { ponderacion: true } }
          }
        });
        if (eventInfo) {
          const rSum = eventInfo.evaluacion_criterios.reduce((acc, c) => acc + Number(c.ponderacion), 0);
          const maxJ = eventInfo.max_jueces || 5;

          evento_inscrito = {
            id: Number(eventInfo.id),
            nombre: eventInfo.nombre,
            descripcion: eventInfo.descripcion,
            fecha_inicio: eventInfo.fecha_inicio,
            fecha_fin: eventInfo.fecha_fin,
            configuracion_lista: (eventInfo._count.evento_jueces >= maxJ) && (Math.abs(rSum - 100) < 0.01)
          };
        }
      }
    } else {
      // Fallback 1: Use last viewed event from preferences
      if (lastViewedId) {
        activeMembership = memberships.find(m => 
          m.equipos.proyectos.some(p => p.evento_id === lastViewedId)
        );
        if (activeMembership) {
          activeProyectoData = activeMembership.equipos.proyectos.find(p => p.evento_id === lastViewedId);
        }
      }

      // Fallback 2: Intelligent auto-selection (Active > Future > Past)
      if (!activeMembership) {
        const now = new Date();
        const sortedParticipaciones = [...participaciones].sort((a, b) => {
          const getWeight = (p: any) => {
            const start = p.fecha_inicio ? new Date(p.fecha_inicio) : null;
            const end = p.fecha_fin ? new Date(p.fecha_fin) : null;
            if (start && end && now >= start && now <= end) return 100; // Active
            if (start && now < start) return 50; // Future
            return 0; // Past
          };
          const weightDiff = getWeight(b) - getWeight(a);
          if (weightDiff !== 0) return weightDiff;
          // Sub-sort by end date descending
          return new Date(b.fecha_fin || 0).getTime() - new Date(a.fecha_fin || 0).getTime();
        });
        
        const defaultPart = sortedParticipaciones[0];
        if (defaultPart) {
          activeMembership = memberships.find(m => Number(m.equipos.id) === defaultPart.equipo_id);
          if (activeMembership) {
            activeProyectoData = activeMembership.equipos.proyectos.find(p => Number(p.id) === defaultPart.proyecto_id);
          }
        }
      }
    }

    // 2.7 Persist current selection as preference
    const currentEventoId = activeProyectoData ? activeProyectoData.evento_id : (evento_inscrito ? BigInt(evento_inscrito.id) : null);
    if (currentEventoId && (proyectoIdReq || eventoIdReq || currentEventoId !== lastViewedId)) {
      try {
        await prisma.user_preferences.upsert({
          where: { user_id: BigInt(userId as string) },
          update: { 
            settings: JSON.stringify({ last_evento_id: currentEventoId.toString() }),
            updated_at: new Date()
          },
          create: {
            user_id: BigInt(userId as string),
            settings: JSON.stringify({ last_evento_id: currentEventoId.toString() }),
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      } catch (e) {
        console.error('Error saving user preferences:', e);
      }
    }

    if (activeMembership && activeProyectoData) {
      equipo = {
        id: Number(activeMembership.equipos.id),
        nombre: activeMembership.equipos.nombre
      };

      // 3. Get team members for active context
      const miembrosData = await prisma.equipo_miembros.findMany({
        where: { equipo_id: activeMembership.equipo_id },
        include: { users: { select: { id: true, name: true } } }
      });
      miembros = miembrosData.map(m => ({
        id: Number(m.users.id),
        nombre: m.users.name,
        perfil: m.rol || 'Miembro',
        es_lider: m.rol === 'LIDER'
      }));

      // 4. Set project info
      proyecto = {
        id: Number(activeProyectoData.id),
        nombre: activeProyectoData.nombre,
        descripcion: activeProyectoData.descripcion,
        repositorio_url: activeProyectoData.repositorio_url || null,
        evento_id: Number(activeProyectoData.evento_id)
      };

      // 6. Event info
      if (activeProyectoData.eventos) {
        const evId = activeProyectoData.eventos.id;
        const [juecesCount, criterios] = await Promise.all([
          prisma.evento_jueces.count({ where: { evento_id: evId } }),
          prisma.evaluacion_criterios.findMany({ where: { evento_id: evId }, select: { ponderacion: true } })
        ]);
        const rSum = criterios.reduce((acc, c) => acc + Number(c.ponderacion), 0);
        const maxJ = activeProyectoData.eventos.max_jueces || 5;

        evento_inscrito = {
          id: Number(activeProyectoData.eventos.id),
          nombre: activeProyectoData.eventos.nombre,
          descripcion: activeProyectoData.eventos.descripcion,
          fecha_inicio: activeProyectoData.eventos.fecha_inicio,
          fecha_fin: activeProyectoData.eventos.fecha_fin,
          configuracion_lista: (juecesCount >= maxJ) && (Math.abs(rSum - 100) < 0.01),
          falta_configuracion: {
            jueces: juecesCount < maxJ,
            rubrica: Math.abs(rSum - 100) > 0.01
          }
        };

        // 5. Get scores by criteria and comments (Weighted Calculation from production)
        const criteriosEventos = await prisma.evaluacion_criterios.findMany({
          where: { evento_id: BigInt(activeProyectoData.evento_id) }
        });

        const evaluacionesRaw = await prisma.evaluaciones.findMany({
          where: { proyecto_id: activeProyectoData.id },
          include: { users: { select: { name: true } } }
        });

        const judgeComments: Record<string, { juez: string, texto: string, fecha: Date }> = {};
        const scoresPerJudge: Record<string, Record<string, number>> = {};
        const judgesThatRated = new Set<string>();

        for (const ev of evaluacionesRaw) {
          const juezId = ev.juez_id.toString();
          const critId = ev.criterio_id.toString();
          judgesThatRated.add(juezId);

          if (!scoresPerJudge[juezId]) scoresPerJudge[juezId] = {};
          scoresPerJudge[juezId][critId] = Number(ev.puntuacion);

          if (ev.comentario) {
            const existing = judgeComments[juezId];
            if (!existing || ev.created_at > existing.fecha) {
              judgeComments[juezId] = {
                juez: ev.users.name,
                texto: ev.comentario,
                fecha: ev.created_at
              };
            }
          }
        }

        const tempChartLabels: string[] = [];
        const tempChartData: number[] = [];
        let grandTotal = 0;

        // Calculate average per criterion for the chart
        for (const criterion of criteriosEventos) {
          tempChartLabels.push(criterion.nombre);
          let sumCrit = 0;
          let countCrit = 0;
          for (const jId of judgesThatRated) {
             const s = scoresPerJudge[jId][criterion.id.toString()];
             if (s !== undefined) {
               sumCrit += s;
               countCrit++;
             }
          }
          const avgCrit = countCrit > 0 ? sumCrit / countCrit : 0;
          tempChartData.push(Math.round(avgCrit * 10) / 10);
        }

        // Calculate weighted average of judges
        if (judgesThatRated.size > 0) {
          let sumWeightedTotals = 0;
          for (const jId of judgesThatRated) {
            let judgeWeightedTotal = 0;
            for (const criterion of criteriosEventos) {
              const score = scoresPerJudge[jId][criterion.id.toString()] || 0;
              judgeWeightedTotal += (score * Number(criterion.ponderacion)) / 100;
            }
            sumWeightedTotals += judgeWeightedTotal;
          }
          grandTotal = sumWeightedTotals / judgesThatRated.size;
        }

        chartLabels = tempChartLabels;
        chartData = tempChartData;
        comentarios = Object.values(judgeComments);
        puntajeTotal = Number(grandTotal.toFixed(1));

        // 6. Get certificates status
        const constanciasData = await prisma.certificados.findMany({
          where: { user_id: BigInt(userId), evento_id: BigInt(activeProyectoData.evento_id) }
        });
        constancias = {
          individual: constanciasData.some(c => c.tipo === 'INDIVIDUAL'),
          equipo: constanciasData.some(c => c.tipo === 'EQUIPO')
        };
      }
    }

    // 7. Pending invitations (equipo_interacciones with tipo=INVITACION and estado=PENDIENTE)
    const invRows = await prisma.equipo_interacciones.findMany({
      where: {
        user_id: BigInt(userId),
        tipo: 'INVITACION',
        estado: 'PENDIENTE'
      },
      include: { equipos: true, perfiles: true }
    });
    invitaciones = invRows.map((inv: any) => ({
      id: Number(inv.id),
      equipo: { id: Number(inv.equipos.id), nombre: inv.equipos.nombre },
      rol: inv.perfiles?.nombre || 'Miembro',
      estado: inv.estado
    }));

    // 8. Upcoming events (Restored to avoid empty state for users without teams)
    const eventosData = await prisma.eventos.findMany({
      where: { fecha_inicio: { gt: new Date() } },
      include: { 
        _count: { select: { evento_jueces: true } },
        evaluacion_criterios: { select: { ponderacion: true } }
      },
      orderBy: { fecha_inicio: 'asc' },
      take: 5
    });
    const eventos = eventosData.map(e => {
        const rSum = e.evaluacion_criterios.reduce((acc, c) => acc + Number(c.ponderacion), 0);
        const maxJ = e.max_jueces || 5;
        return {
          id: Number(e.id),
          nombre: e.nombre,
          descripcion: e.descripcion,
          fecha_inicio: e.fecha_inicio,
          fecha_fin: e.fecha_fin,
          configuracion_lista: (e._count.evento_jueces >= maxJ) && (Math.abs(rSum - 100) < 0.01)
        };
    });

    res.json({
      success: true,
      data: {
        registrado,
        equipo,
        proyecto,
        miembros,
        puntajeTotal,
        chartLabels,
        chartData,
        comentarios,
        invitaciones,
        eventos,
        evento_inscrito,
        constancias,
        user_info: {
          name: user?.name,
          email: user?.email,
          no_control: user?.no_control,
          carrera: user?.carrera,
          telefono: user?.telefono
        },
        es_lider: miembros.some(m => m.id === Number(userId) && m.es_lider),
        participaciones,
        solicitudes_pendientes: (miembros.some(m => m.id === Number(userId) && m.es_lider) && equipo)
          ? await prisma.equipo_interacciones.findMany({
              where: {
                equipo_id: BigInt(equipo.id),
                tipo: 'SOLICITUD',
                estado: 'PENDIENTE'
              },
              include: {
                users: {
                  select: { name: true, no_control: true }
                },
                perfiles: {
                  select: { nombre: true }
                }
              }
            }).then(rows => rows.map(r => ({
              id: Number(r.id),
              participante: {
                user: { name: r.users.name },
                no_control: r.users.no_control
              },
              perfilSugerido: r.perfiles ? { nombre: r.perfiles.nombre } : null
            })))
          : []
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/dashboard/registro-inicial:
 *   get:
 *     summary: Obtener datos para el registro inicial
 *     tags: [Participante]
 */
router.get('/dashboard/registro-inicial', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.users.findUnique({
      where: { id: BigInt(userId) },
      select: { no_control: true, carrera: true, telefono: true }
    });

    const carreras = await prisma.carreras.findMany({
      where: { deleted_at: null },
      orderBy: { nombre: 'asc' }
    });

    res.json({
      success: true,
      data: {
        user: {
          no_control: user?.no_control || '',
          carrera: user?.carrera || '',
          telefono: user?.telefono || ''
        },
        carreras: carreras.map(c => ({ id: Number(c.id), nombre: c.nombre }))
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/dashboard/registro-inicial:
 *   post:
 *     summary: Guardar datos del registro inicial
 *     tags: [Participante]
 */
router.post('/dashboard/registro-inicial', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { no_control, carrera, telefono } = req.body;

    if (!no_control || !carrera || !telefono) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    // Basic formats
    if (!/^\d{8}$/.test(no_control)) {
      return res.status(400).json({ success: false, message: 'El número de control debe tener 8 dígitos' });
    }
    if (!/^\d{10}$/.test(telefono)) {
      return res.status(400).json({ success: false, message: 'El teléfono debe tener 10 dígitos' });
    }

    // Uniqueness checks
    const existingNoControl = await prisma.users.findFirst({
      where: { no_control, NOT: { id: BigInt(userId as string) } }
    });
    if (existingNoControl) {
      return res.status(400).json({ success: false, message: 'Este número de control ya está vinculado a otra cuenta' });
    }

    const existingTelefono = await prisma.users.findFirst({
      where: { telefono, NOT: { id: BigInt(userId as string) } }
    });
    if (existingTelefono) {
      return res.status(400).json({ success: false, message: 'Este número de teléfono ya está vinculado a otra cuenta' });
    }

    await prisma.users.update({
      where: { id: BigInt(userId as string) },
      data: {
        no_control,
        carrera,
        telefono,
        updated_at: new Date()
      }
    });

    res.json({ success: true, message: 'Información académica registrada correctamente' });
  } catch (error) {
    next(error);
  }
});


/**
 * @swagger
 * /api/participante/eventos-disponibles:
 *   get:
 *     summary: Listar eventos disponibles para registro
 *     tags: [Participante]
 */
router.get('/eventos-disponibles', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventos = await prisma.eventos.findMany({
      where: { fecha_inicio: { gt: new Date() } },
      orderBy: { fecha_inicio: 'asc' }
    });
    res.json({ success: true, data: eventos });
  } catch (error) {
    next(error);
  }
});

// Alias para compatibilidad con vistas de registro
router.get('/eventos-proximos', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventos = await prisma.eventos.findMany({
      where: { fecha_fin: { gte: new Date() } },
      orderBy: { fecha_inicio: 'asc' }
    });
    res.json({ success: true, data: eventos.map(e => ({
      ...e,
      id: Number(e.id)
    })) });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos-disponibles:
 *   get:
 *     summary: Listar equipos con vacantes en un evento
 *     tags: [Participante]
 */
router.get('/equipos-disponibles', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { evento_id, search } = req.query;
    if (!evento_id) return res.status(400).json({ success: false, message: 'evento_id es requerido' });

    const currentUserId = req.user!.id;

    const equipos = await prisma.equipos.findMany({
      where: {
        proyectos: { some: { evento_id: BigInt(evento_id as string) } },
        nombre: search ? { contains: search as string } : undefined
      },
      include: {
        equipo_miembros: true,
        proyectos: true
      }
    });

    const result = equipos.map(e => {
      const max_miembros = 5; // O el valor que tengas configurado
      const miembros_actuales = e.equipo_miembros.length;
      const solicitado = false; // Aquí podrías añadir lógica si hay tabla de solicitudes

      return {
        id: Number(e.id),
        nombre: e.nombre,
        miembros: miembros_actuales,
        max_miembros,
        vacantes: max_miembros - miembros_actuales,
        proyecto_nombre: e.proyectos[0]?.nombre || 'Sin Proyecto',
        descripcion: e.proyectos[0]?.descripcion || '',
        solicitado 
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos:
 *   post:
 *     summary: Registrar un nuevo equipo y proyecto
 *     tags: [Participante]
 */
router.post('/equipos', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { nombre, evento_id, proyecto_nombre, proyecto_descripcion, repositorio_url } = req.body;

    if (!nombre || !evento_id || !proyecto_nombre || !proyecto_descripcion) {
      return res.status(400).json({ success: false, message: 'Todos los campos obligatorios deben ser completados' });
    }

    // 0. Verificación: ¿El evento ya comenzó o está incompleto?
    const evento = await prisma.eventos.findUnique({ 
      where: { id: BigInt(evento_id as string) },
      include: {
        _count: { select: { evento_jueces: true } },
        evaluacion_criterios: { select: { ponderacion: true } }
      }
    });

    if (!evento) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    }

    // 1. Verificación: ¿Ya está en un equipo para este evento?
    const userInEvent = await prisma.proyectos.findFirst({
      where: {
        evento_id: BigInt(evento_id as string),
        equipos: {
          equipo_miembros: {
            some: { user_id: BigInt(userId as string) }
          }
        }
      }
    });

    if (userInEvent) {
      return res.status(400).json({ success: false, message: 'Ya perteneces a un equipo registrado en este mismo evento.' });
    }

    if (new Date(evento.fecha_inicio) <= new Date()) {
      return res.status(400).json({ success: false, message: 'No se pueden crear equipos para un evento que ya ha comenzado.' });
    }

    // Validación de configuración completa
    const rSum = evento.evaluacion_criterios.reduce((acc, c) => acc + Number(c.ponderacion), 0);
    const maxJ = evento.max_jueces || 5;
    if (evento._count.evento_jueces < maxJ || Math.abs(rSum - 100) > 0.01) {
      return res.status(400).json({ 
        success: false, 
        message: 'El evento se encuentra en fase de configuración técnica. Por favor, espera a que el administrador complete el panel de jueces y la rúbrica para poder registrarte.' 
      });
    }

    // 2. Crear el equipo
    const team = await prisma.equipos.create({
      data: {
        nombre,
        updated_at: new Date()
      }
    });

    // 3. Asignar al creador como LIDER
    await prisma.equipo_miembros.create({
      data: {
        equipo_id: team.id,
        user_id: BigInt(userId as string),
        rol: 'LIDER'
      }
    });

    // 4. Crear el proyecto asociado
    await prisma.proyectos.create({
      data: {
        equipo_id: team.id,
        evento_id: BigInt(evento_id as string),
        nombre: proyecto_nombre,
        descripcion: proyecto_descripcion,
        repositorio_url: repositorio_url || null,
        updated_at: new Date()
      }
    });

    res.json({ success: true, message: 'Equipo y proyecto registrados exitosamente' });
  } catch (error) {
    next(error);
  }
});


/**
 * @swagger
 * /api/participante/equipos/salir:
 *   delete:
 *     summary: Abandonar el equipo actual
 *     tags: [Participante]
 */
router.delete('/equipos/salir', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { nuevoLiderId } = req.body;
    
    const membership = await prisma.equipo_miembros.findFirst({
      where: { user_id: BigInt(userId) },
      include: {
        equipos: {
          include: {
            equipo_miembros: true,
            proyectos: { include: { eventos: true } }
          }
        }
      }
    });

    if (!membership) {
      return res.status(404).json({ success: false, message: 'No perteneces a ningún equipo.' });
    }

    // Validar que el evento no haya iniciado o ya finalizado
    const proyectoSalir = membership.equipos.proyectos[0];
    if (proyectoSalir?.eventos) {
      const ahoraSalir = new Date();
      const fechaInicioSalir = new Date(proyectoSalir.eventos.fecha_inicio);
      if (ahoraSalir >= fechaInicioSalir) {
        return res.status(403).json({
          success: false,
          message: 'No puedes abandonar el equipo una vez que el evento ha iniciado o ya finalizó.'
        });
      }
    }

    const equipoId = membership.equipo_id;
    const esLider = membership.rol === 'LIDER';
    const otrosMiembros = membership.equipos.equipo_miembros.filter(m => m.user_id !== BigInt(userId));
    const otrosLideres = otrosMiembros.filter(m => m.rol === 'LIDER');

    // Caso: Es el único líder y hay más gente -> Requiere sucesor
    if (esLider && otrosLideres.length === 0 && otrosMiembros.length > 0) {
      if (!nuevoLiderId) {
        return res.status(400).json({ 
          success: false, 
          requiresSuccessor: true,
          message: 'Como único líder, debes designar a un sucesor antes de abandonar el equipo.' 
        });
      }

      // Validar que el nuevoLiderId sea un miembro válido del equipo
      const sucesor = otrosMiembros.find(m => m.user_id === BigInt(nuevoLiderId));
      if (!sucesor) {
        return res.status(400).json({ success: false, message: 'El sucesor designado no es válido o no pertenece a tu equipo.' });
      }

      // Transacción: Promover y Salir
      await prisma.$transaction([
        prisma.equipo_miembros.update({
          where: { id: sucesor.id },
          data: { rol: 'LIDER' }
        }),
        prisma.equipo_miembros.delete({
          where: { id: membership.id }
        }),
        prisma.equipo_interacciones.updateMany({
          where: { user_id: BigInt(userId), estado: 'PENDIENTE' },
          data: { estado: 'RECHAZADA', respondido_en: new Date() }
        })
      ]);

      return res.json({ success: true, message: 'Has designado un nuevo líder y abandonado el equipo correctamente.' });
    }

    // Caso: Es líder y está SOLO
    if (esLider && otrosLideres.length === 0 && otrosMiembros.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No puedes abandonar el equipo siendo el único integrante. Para eliminarlo, contacta al administrador.' 
        });
    }

    // Caso normal: No es líder o hay otros líderes
    await prisma.equipo_miembros.delete({
      where: { id: membership.id }
    });

    await prisma.equipo_interacciones.updateMany({
      where: { user_id: BigInt(userId), estado: 'PENDIENTE' },
      data: { estado: 'RECHAZADA', respondido_en: new Date() }
    });

    res.json({ success: true, message: 'Has abandonado el equipo correctamente.' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos/{id}:
 *   get:
 *     summary: Obtener detalles del equipo para gestión
 *     tags: [Participante]
 */
router.get('/equipos/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const equipo = await prisma.equipos.findUnique({
      where: { id: BigInt(id as string) },
      include: {
        proyectos: { include: { eventos: true } },
        equipo_miembros: { include: { users: true } }
      }
    });

    if (!equipo) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });

    // Verificar pertenencia
    const esMiembro = equipo.equipo_miembros.some(m => m.user_id === BigInt(userId as string));
    if (!esMiembro) return res.status(403).json({ success: false, message: 'No tienes permiso para ver este equipo' });

    res.json({
      success: true,
      data: {
        equipo: {
          id: Number(equipo.id),
          nombre: equipo.nombre
        },
        proyecto: equipo.proyectos[0] ? {
          ...equipo.proyectos[0],
          id: Number(equipo.proyectos[0].id),
          equipo_id: Number(equipo.proyectos[0].equipo_id),
          evento_id: Number(equipo.proyectos[0].evento_id),
          evento: equipo.proyectos[0].eventos ? {
            ...equipo.proyectos[0].eventos,
            id: Number(equipo.proyectos[0].eventos.id)
          } : null
        } : null,
        miembros: equipo.equipo_miembros.map(m => ({
          id: Number(m.users.id),
          nombre: m.users.name,
          email: m.users.email,
          carrera: m.users.carrera,
          rol: m.rol,
          es_lider: m.rol === 'LIDER'
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos/{id}:
 *   put:
 *     summary: Actualizar datos del equipo/proyecto
 *     tags: [Participante]
 */
router.put('/equipos/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { nombre, proyecto_nombre, proyecto_descripcion, repositorio_url } = req.body;

    const membership = await prisma.equipo_miembros.findFirst({
      where: { equipo_id: BigInt(id as string), user_id: BigInt(userId as string) }
    });

    if (!membership || membership.rol !== 'LIDER') {
      return res.status(403).json({ success: false, message: 'Solo el líder puede actualizar el equipo' });
    }

    await prisma.$transaction([
      prisma.equipos.update({
        where: { id: BigInt(id as string) },
        data: { nombre, updated_at: new Date() }
      }),
      prisma.proyectos.updateMany({
        where: { equipo_id: BigInt(id as string) },
        data: {
          nombre: proyecto_nombre,
          descripcion: proyecto_descripcion,
          repositorio_url: repositorio_url || null,
          updated_at: new Date()
        }
      })
    ]);

    res.json({ success: true, message: 'Información actualizada correctamente' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/candidatos:
 *   get:
 *     summary: Buscar participantes disponibles para reclutar en un evento específico
 *     tags: [Participante]
 */
router.get('/candidatos', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = (req.query.q as string || '').toLowerCase();
    const eventoId = req.query.evento_id as string;
    const equipoId = req.query.equipo_id as string;
    const userId = req.user!.id;

    // Collect user IDs to exclude
    const excludeUserIds: bigint[] = [BigInt(userId)];

    // If an evento_id is provided, exclude users already in that event
    if (eventoId) {
      const usersInEvent = await prisma.equipo_miembros.findMany({
        where: {
          equipos: {
            proyectos: {
              some: { evento_id: BigInt(eventoId) }
            }
          }
        },
        select: { user_id: true }
      });
      usersInEvent.forEach(u => excludeUserIds.push(u.user_id));
    }

    // Exclude users with pending invitations from this team
    if (equipoId) {
      const pendingInvites = await prisma.equipo_interacciones.findMany({
        where: {
          equipo_id: BigInt(equipoId),
          tipo: 'INVITACION',
          estado: 'PENDIENTE'
        },
        select: { user_id: true }
      });
      pendingInvites.forEach(inv => excludeUserIds.push(inv.user_id));
    }

    // Build query
    const whereClause: any = {
      role: 'PARTICIPANTE',
      id: { notIn: excludeUserIds },
      OR: [
        { name: { contains: query } },
        { email: { contains: query } }
      ]
    };

    // If no evento_id, fallback to legacy behavior
    if (!eventoId && !equipoId) {
      whereClause.equipo_miembros = { none: {} };
    }

    const candidatos = await prisma.users.findMany({
      where: whereClause,
      select: { id: true, name: true, carrera: true, no_control: true, email: true },
      take: 20
    });

    res.json({
      success: true,
      data: candidatos.map(c => ({
        id: Number(c.id),
        name: c.name,
        email: c.email,
        carrera: c.carrera || 'N/A',
        no_control: c.no_control
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos/invitar:
 *   post:
 *     summary: Enviar invitación a un participante
 *     tags: [Participante]
 */
router.post('/equipos/invitar', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { participante_id, equipo_id, mensaje, perfil_id } = req.body;

    const membership = await prisma.equipo_miembros.findFirst({
      where: { equipo_id: BigInt(equipo_id as string), user_id: BigInt(userId as string) }
    });

    if (!membership || membership.rol !== 'LIDER') {
      return res.status(403).json({ success: false, message: 'Solo el líder puede enviar invitaciones' });
    }

    // 1. Verificar capacidad (Máximo 5)
    const memberCount = await prisma.equipo_miembros.count({
      where: { equipo_id: BigInt(equipo_id as string) }
    });
    if (memberCount >= 5) {
      return res.status(400).json({ success: false, message: 'Tu equipo ya tiene el máximo permitido (5 integrantes).' });
    }

    // 2. Verificar si el evento comenzó
    const proyecto = await prisma.proyectos.findFirst({
        where: { equipo_id: BigInt(equipo_id as string) },
        include: { eventos: true }
    });
    if (proyecto && proyecto.eventos && new Date(proyecto.eventos.fecha_inicio) <= new Date()) {
        return res.status(400).json({ success: false, message: 'No puedes invitar a más personas una vez que el evento ha comenzado.' });
    }

    if (!proyecto) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }

    // 3. Verificar si el destinatario ya está participando en ESTE evento
    const targetInEvent = await prisma.proyectos.findFirst({
        where: {
            evento_id: proyecto.evento_id,
            equipos: {
                equipo_miembros: {
                    some: { user_id: BigInt(participante_id as string) }
                }
            }
        }
    });

    if (targetInEvent) return res.status(400).json({ success: false, message: 'El participante seleccionado ya está registrado en este mismo evento' });
    
    // Verificar si ya tiene una invitación pendiente de este equipo
    const existingInvite = await prisma.equipo_interacciones.findFirst({
        where: {
            equipo_id: BigInt(equipo_id as string),
            user_id: BigInt(participante_id as string),
            tipo: 'INVITACION',
            estado: 'PENDIENTE'
        }
    });

    if (existingInvite) {
        return res.status(400).json({ success: false, message: 'Ya has enviado una invitación a este participante y aún está pendiente.' });
    }

    // Crear interacción
    await prisma.equipo_interacciones.create({
      data: {
        equipo_id: BigInt(equipo_id),
        user_id: BigInt(participante_id),
        tipo: 'INVITACION',
        estado: 'PENDIENTE',
        mensaje: mensaje || null,
        perfil_id: perfil_id ? BigInt(perfil_id) : null
      }
    });

    res.json({ success: true, message: 'Invitación enviada correctamente' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos/miembros/{id}:
 *   delete:
 *     summary: Eliminar un miembro del equipo
 *     tags: [Participante]
 */
router.delete('/equipos/miembros/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const memberId = req.params.id; // El ID del usuario a eliminar

    // 1. Obtener mi equipo y verificar si soy líder
    const myMembership = await prisma.equipo_miembros.findFirst({
      where: { user_id: BigInt(userId) },
      include: {
        equipos: {
          include: {
            proyectos: {
              include: { eventos: true }
            }
          }
        }
      }
    });

    if (!myMembership || myMembership.rol !== 'LIDER') {
      return res.status(403).json({ success: false, message: 'Solo el líder puede eliminar miembros' });
    }

    if (String(BigInt(userId as string)) === String(BigInt(memberId as string))) {
      return res.status(400).json({ success: false, message: 'No puedes eliminarte a ti mismo desde aquí. Usa "Abandonar equipo".' });
    }

    // 2. Validar que el evento no haya iniciado o finalizado
    const proyecto = myMembership.equipos.proyectos[0];
    if (proyecto?.eventos) {
      const ahora = new Date();
      const fechaInicio = new Date(proyecto.eventos.fecha_inicio);
      if (ahora >= fechaInicio) {
        return res.status(403).json({
          success: false,
          message: 'No puedes eliminar miembros una vez que el evento ha iniciado o ya finalizó.'
        });
      }
    } else if (!proyecto) {
      // Si el equipo ya está registrado en un evento pero no tiene proyecto asociado,
      // es una anomalía — bloquear por seguridad solo si hay membresía activa con evento
      // (si no hay proyecto en absoluto, se permite porque aún no se inscribió)
    }

    // 3. Eliminar el miembro del equipo
    await prisma.equipo_miembros.deleteMany({
      where: { 
        equipo_id: myMembership.equipo_id,
        user_id: BigInt(memberId as string)
      }
    });

    res.json({ success: true, message: 'Miembro eliminado del equipo' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/perfiles:
 *   get:
 *     summary: Listar perfiles (roles) disponibles
 *     tags: [Participante]
 */
router.get('/perfiles', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const perfiles = await prisma.perfiles.findMany({
      where: { 
        deleted_at: null,
        NOT: {
          nombre: {
            in: ['LIDER', 'Líder', 'Lider']
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });
    res.json({ success: true, data: perfiles.map(p => ({ id: Number(p.id), nombre: p.nombre })) });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos/{id}/invitaciones:
 *   get:
 *     summary: Obtener historial de invitaciones enviadas por el equipo
 *     tags: [Participante]
 */
router.get('/equipos/:id/invitaciones', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const invs = await prisma.equipo_interacciones.findMany({
      where: { equipo_id: BigInt(id as string), tipo: 'INVITACION' },
      include: { users: true, perfiles: true },
      orderBy: { created_at: 'desc' }
    });

    res.json({
      success: true,
      data: invs.map(i => ({
        id: Number(i.id),
        usuario: { name: i.users.name, email: i.users.email },
        estado: i.estado,
        mensaje: i.mensaje,
        perfil_id: i.perfil_id ? Number(i.perfil_id) : null,
        perfil_nombre: i.perfiles?.nombre || null,
        created_at: i.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos/invitaciones/{id}:
 *   put:
 *     summary: Editar el rol de una invitación pendiente
 *     tags: [Participante]
 */
router.put('/equipos/invitaciones/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const invId = req.params.id as string;
    const { perfil_id } = req.body;

    const inv = await prisma.equipo_interacciones.findUnique({
      where: { id: BigInt(invId) },
      include: { equipos: { include: { equipo_miembros: true } } }
    });

    if (!inv) return res.status(404).json({ success: false, message: 'Invitación no encontrada' });
    if (inv.estado !== 'PENDIENTE') return res.status(400).json({ success: false, message: 'Solo se pueden editar invitaciones pendientes' });

    const esLider = inv.equipos.equipo_miembros.some(m => m.user_id === BigInt(userId) && m.rol === 'LIDER');
    if (!esLider) return res.status(403).json({ success: false, message: 'Solo el líder puede editar invitaciones' });

    await prisma.equipo_interacciones.update({
      where: { id: BigInt(invId) },
      data: { perfil_id: perfil_id ? BigInt(perfil_id) : null }
    });

    res.json({ success: true, message: 'Invitación actualizada correctamente' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos/invitaciones/{id}:
 *   delete:
 *     summary: Cancelar/eliminar una invitación pendiente
 *     tags: [Participante]
 */
router.delete('/equipos/invitaciones/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const invId = req.params.id as string;

    const inv = await prisma.equipo_interacciones.findUnique({
      where: { id: BigInt(invId) },
      include: { equipos: { include: { equipo_miembros: true } } }
    });

    if (!inv) return res.status(404).json({ success: false, message: 'Invitación no encontrada' });
    if (inv.estado !== 'PENDIENTE') return res.status(400).json({ success: false, message: 'Solo se pueden cancelar invitaciones pendientes' });

    const esLider = inv.equipos.equipo_miembros.some(m => m.user_id === BigInt(userId) && m.rol === 'LIDER');
    if (!esLider) return res.status(403).json({ success: false, message: 'Solo el líder puede cancelar invitaciones' });

    await prisma.equipo_interacciones.delete({ where: { id: BigInt(invId) } });

    res.json({ success: true, message: 'Invitación cancelada correctamente' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/invitaciones/{id}/responder:
 *   post:
 *     summary: Responder a una invitación (Aceptar/Rechazar)
 *     tags: [Participante]
 */
router.post('/invitaciones/:id/responder', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const userId = req.user!.id;

    const interaction = await prisma.equipo_interacciones.findUnique({
      where: { id: BigInt(id as string) },
      include: { 
        perfiles: true,
        equipos: { include: { proyectos: true } }
      }
    });

    if (!interaction || interaction.user_id !== BigInt(userId as string) || interaction.estado !== 'PENDIENTE') {
      return res.status(400).json({ success: false, message: 'Invitación no válida o ya respondida' });
    }

    const nuevoEstado = String(estado).toUpperCase();

    if (nuevoEstado === 'ACEPTADA') {
      // 1. Verificar si ya está participando en el evento de este equipo
      const userInEvent = await prisma.proyectos.findFirst({
        where: {
          evento_id: interaction.equipos.proyectos[0]?.evento_id,
          equipos: {
            equipo_miembros: {
              some: { user_id: BigInt(userId) }
            }
          }
        }
      });

      if (userInEvent) return res.status(400).json({ success: false, message: 'Ya eres parte de un equipo en este evento.' });

      // 1. Verificar capacidad del equipo (Máximo 5)
      const memberCount = await prisma.equipo_miembros.count({
        where: { equipo_id: interaction.equipo_id }
      });
      if (memberCount >= 5) {
        return res.status(400).json({ success: false, message: 'El equipo ya ha alcanzado su capacidad máxima (5 integrantes).' });
      }

      // 2. Verificar si el evento ya comenzó (Bloqueo de fichajes de última hora)
      const proyecto = await prisma.proyectos.findFirst({
        where: { equipo_id: interaction.equipo_id },
        include: { eventos: true }
      });
      
      if (proyecto && proyecto.eventos) {
        if (new Date(proyecto.eventos.fecha_inicio) <= new Date()) {
          return res.status(400).json({ success: false, message: 'No puedes unirte a un equipo si el evento ya ha comenzado.' });
        }
      }

      await prisma.$transaction([
        prisma.equipo_interacciones.update({
          where: { id: BigInt(id as string) },
          data: { estado: 'ACEPTADA', respondido_en: new Date() }
        }),
        prisma.equipo_miembros.create({
          data: {
            equipo_id: interaction.equipo_id,
            user_id: BigInt(userId as string),
            rol: interaction.perfiles?.nombre || 'PROGRAMADOR'
          }
        })
      ]);
      return res.json({ success: true, message: 'Invitación aceptada correctamente' });
    } else {
      await prisma.equipo_interacciones.update({
        where: { id: BigInt(id as string) },
        data: { estado: 'RECHAZADA', respondido_en: new Date() }
      });
      return res.json({ success: true, message: 'Invitación rechazada' });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/solicitudes:
 *   post:
 *     summary: Enviar solicitud para unirse a un equipo
 *     tags: [Participante]
 */
router.post('/solicitudes', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { equipo_id, perfil_id, mensaje } = req.body;

    if (!equipo_id) return res.status(400).json({ success: false, message: 'Equipo no especificado' });
    if (!perfil_id) return res.status(400).json({ success: false, message: 'Debe seleccionar un rol' });

    // 1. Verificar si el usuario ya está en este evento específico
    const targetTeamProject = await prisma.proyectos.findFirst({
      where: { equipo_id: BigInt(equipo_id as string) }
    });

    if (targetTeamProject) {
      const userInEvent = await prisma.proyectos.findFirst({
        where: {
          evento_id: targetTeamProject.evento_id,
          equipos: {
            equipo_miembros: {
              some: { user_id: BigInt(userId as string) }
            }
          }
        }
      });
      if (userInEvent) return res.status(400).json({ success: false, message: 'Ya estás participando en este evento con otro equipo.' });
    }

    // 2. Verificar si ya hay una solicitud pendiente para ESTE equipo
    const solicitudExistente = await prisma.equipo_interacciones.findFirst({
      where: {
        user_id: BigInt(userId as string),
        equipo_id: BigInt(equipo_id as string),
        tipo: 'SOLICITUD',
        estado: 'PENDIENTE'
      }
    });
    if (solicitudExistente) return res.status(400).json({ success: false, message: 'Ya tienes una solicitud pendiente para este equipo' });

    // 3. Crear interacción con rol y mensaje
    await prisma.equipo_interacciones.create({
      data: {
        user_id: BigInt(userId as string),
        equipo_id: BigInt(equipo_id as string),
        tipo: 'SOLICITUD',
        estado: 'PENDIENTE',
        perfil_id: BigInt(perfil_id as string),
        mensaje: mensaje || null
      }
    });

    res.json({ success: true, message: 'Solicitud enviada correctamente' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos/{id}/solicitar-info:
 *   get:
 *     summary: Obtener detalles de un equipo para solicitud
 *     tags: [Participante]
 */
router.get('/equipos/:id/solicitar-info', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const equipo = await prisma.equipos.findUnique({
      where: { id: BigInt(id as string) },
      include: {
        proyectos: { select: { nombre: true } },
        equipo_miembros: { select: { id: true } }
      }
    });

    if (!equipo) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });

    res.json({
      success: true,
      data: {
        id: Number(equipo.id),
        nombre: equipo.nombre,
        proyecto_nombre: equipo.proyectos[0]?.nombre || 'Sin proyecto',
        miembros: equipo.equipo_miembros.length,
        max_miembros: 5 // Hardcoded por solicitud del usuario
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos/{id}/solicitudes:
 *   get:
 *     summary: Listar todas las solicitudes para el equipo (Líder solamente)
 *     tags: [Participante]
 */
router.get('/equipos/:id/solicitudes', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id: equipoId } = req.params;

    const membership = await prisma.equipo_miembros.findFirst({
      where: { equipo_id: BigInt(equipoId as string), user_id: BigInt(userId as string) }
    });

    if (!membership || membership.rol !== 'LIDER') {
      return res.status(403).json({ success: false, message: 'Solo el líder puede ver las solicitudes' });
    }

    const solicitudes = await prisma.equipo_interacciones.findMany({
      where: { equipo_id: BigInt(equipoId as string), tipo: 'SOLICITUD' },
      include: {
        users: { select: { name: true, email: true, no_control: true, carrera: true } },
        perfiles: { select: { nombre: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({
      success: true,
      data: solicitudes.map(s => ({
        id: Number(s.id),
        participante: {
          user: { name: s.users.name, email: s.users.email },
          no_control: s.users.no_control,
          carrera: { nombre: s.users.carrera }
        },
        mensaje: s.mensaje,
        perfilSugerido: s.perfiles ? { nombre: s.perfiles.nombre } : null,
        estado: s.estado,
        created_at: s.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/solicitudes/{id}/responder:
 *   post:
 *     summary: Responder a una solicitud (Aceptar/Rechazar)
 *     tags: [Participante]
 */
router.post('/solicitudes/:id/responder', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { estado, perfil_id } = req.body;
    const userId = req.user!.id;

    const interaction = await prisma.equipo_interacciones.findUnique({
      where: { id: BigInt(id as string) },
      include: { perfiles: true }
    });

    if (!interaction || interaction.tipo !== 'SOLICITUD') {
        return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    const myMembership = await prisma.equipo_miembros.findFirst({
      where: { equipo_id: interaction.equipo_id, user_id: BigInt(userId as string) }
    });

    if (!myMembership || myMembership.rol !== 'LIDER') {
        return res.status(403).json({ success: false, message: 'Solo el líder puede responder solicitudes' });
    }

    if (interaction.estado !== 'PENDIENTE') {
        return res.status(400).json({ success: false, message: 'La solicitud ya ha sido procesada' });
    }

    const nuevoEstado = String(estado).toUpperCase();

    if (nuevoEstado === 'ACEPTADA') {
      // 1. Verificar capacidad del equipo (5 hardcoded)
      const count = await prisma.equipo_miembros.count({ where: { equipo_id: interaction.equipo_id } });
      if (count >= 5) {
          return res.status(400).json({ success: false, message: 'El equipo ya está completo (máximo 5 integrantes)' });
      }

      // 2. Verificar si el solicitante ya tiene equipo
      const targetHasTeam = await prisma.equipo_miembros.findFirst({ where: { user_id: interaction.user_id } });
      if (targetHasTeam) {
          await prisma.equipo_interacciones.update({
              where: { id: BigInt(id as string) },
              data: { estado: 'RECHAZADA', respondido_en: new Date() }
          });
          return res.status(400).json({ success: false, message: 'El solicitante ya es parte de otro equipo' });
      }

      // 3. Aceptar
      await prisma.$transaction([
          prisma.equipo_interacciones.update({
              where: { id: BigInt(id as string) },
              data: { estado: 'ACEPTADA', respondido_en: new Date() }
          }),
          prisma.equipo_miembros.create({
              data: {
                  equipo_id: interaction.equipo_id,
                  user_id: interaction.user_id,
                  rol: perfil_id ? (await prisma.perfiles.findUnique({ where: { id: BigInt(perfil_id as string) } }))?.nombre || 'PROGRAMADOR' : (interaction.perfiles?.nombre || 'PROGRAMADOR')
              }
          }),
          // Opcional: Rechazar otras solicitudes/invitaciones del usuario? Laravel lo hace implícitamente al no permitir unirse a más de uno.
      ]);

      res.json({ success: true, message: 'Solicitud aceptada. El participante ahora es miembro del equipo.' });
    } else {
      await prisma.equipo_interacciones.update({
          where: { id: BigInt(id as string) },
          data: { estado: 'RECHAZADA', respondido_en: new Date() }
      });
      res.json({ success: true, message: 'Solicitud rechazada' });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/constancias:
 *   get:
 *     summary: Obtener las constancias del participante actual
 *     tags: [Participante]
 */
router.get('/constancias', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const result = await constanciaService.getConstanciasByUser(Number(userId as string));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/constancias/download/{tipo}/{eventoId}:
 *   get:
 *     summary: Descargar un certificado específico
 *     tags: [Participante]
 */
router.get('/constancias/download/:tipo/:eventoId', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { tipo, eventoId } = req.params;

    // 1. Intentar buscar en la base de datos primero (por si hay una personalizada)
    const constancia = await prisma.certificados.findFirst({
      where: {
        user_id: BigInt(userId as string),
        evento_id: BigInt(eventoId as string),
        tipo: tipo as any
      }
    });

    if (constancia && constancia.archivo_path) {
      const absolutePath = path.isAbsolute(constancia.archivo_path) 
        ? constancia.archivo_path 
        : path.join(__dirname, '../../..', constancia.archivo_path);
      return res.download(absolutePath);
    }

    // 2. Fallback Dinámico: Generar al vuelo si el evento terminó
    const evento = await prisma.eventos.findUnique({ where: { id: BigInt(eventoId as string) } });
    if (!evento) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

    if (new Date() < new Date(evento.fecha_fin)) {
      return res.status(403).json({ success: false, message: 'El evento aún no ha finalizado' });
    }

    // Buscar el proyecto y equipo del usuario
    const proyecto = await prisma.proyectos.findFirst({
      where: {
        evento_id: BigInt(eventoId as string),
        equipos: {
          equipo_miembros: { some: { user_id: BigInt(userId as string) } }
        }
      },
      include: {
        equipos: {
          include: {
            equipo_miembros: { include: { users: true } }
          }
        }
      }
    });

    if (!proyecto) return res.status(404).json({ success: false, message: 'No se encontró participación para este evento' });

    // Calcular ranking para saber el logro
    const ranking = await rankingService.calcularRanking(Number(eventoId));
    const pos = ranking.findIndex(r => r.id === Number(proyecto.id)) + 1;
    const textoLogro = rankingService.getTextoLogro(pos);

    // Preparar payload para PdfService
    const payload = {
      proyecto: {
        ...proyecto,
        id: Number(proyecto.id),
        equipo: proyecto.equipos ? {
          ...proyecto.equipos,
          id: Number(proyecto.equipos.id),
          miembros: proyecto.equipos.equipo_miembros.map(m => ({
            ...m,
            id: Number(m.id),
            user: { ...m.users, id: Number(m.users.id) }
          }))
        } : null
      },
      textoLogro,
      nombreTitular: tipo === 'EQUIPO' ? (proyecto.equipos?.nombre || 'Equipo') : (req.user!.name || proyecto.equipos?.equipo_miembros.find(m => Number(m.user_id) === Number(userId))?.users.name || 'Participante'),
      mostrarIntegrantes: tipo === 'EQUIPO',
      evento: { ...evento, id: Number(evento.id) }
    };

    PdfService.generarConstancia(res, payload);
  } catch (error) {
    next(error);
  }
});

export { router as participanteDashboardRouter };
