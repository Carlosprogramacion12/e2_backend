import prisma from '../../utils/prisma';
import { RegistroInicialDto } from './participante.types';

export class ParticipanteRepository {
  async findByUserId(userId: number) {
    return prisma.participantes.findFirst({
      where: { user_id: BigInt(userId) }
    });
  }

  async getDashboardData(userId: number) {
    const participante = await this.findByUserId(userId);
    if (!participante) return { needsProfile: true };

    // 1. Encontrar equipo del participante
    const equipoLink = await prisma.equipo_participante.findFirst({
      where: { participante_id: participante.id },
      include: {
        equipos: true
      }
    });

    const equipo = equipoLink?.equipos || null;
    const esLider = equipoLink ? Number(equipoLink.perfil_id) === 3 : false;

    let proyecto: any = null;
    let solicitudesPendientes: any[] = [];

    // 2. Si tiene equipo, obtener proyecto, evento y solicitudes si es lider
    if (equipo) {
      proyecto = await prisma.proyectos.findFirst({
        where: { equipo_id: equipo.id },
        include: {
          eventos: {
            include: { criterio_evaluacion: true }
          },
          calificaciones: true
        }
      });

      if (esLider) {
        solicitudesPendientes = await prisma.solicitudes_equipo.findMany({
          where: {
            equipo_id: equipo.id,
            estado: 'pendiente'
          },
          include: {
            participantes_solicitudes_equipo_participante_idToparticipantes: {
              include: { users: true, carreras: true }
            },
            perfiles: true
          }
        });
      }
    }

    // 3. Obtener invitaciones pendientes
    const invitacionesPendientes = await prisma.invitaciones_equipo.findMany({
      where: {
        participante_id: participante.id,
        estado: 'pendiente'
      },
      include: {
        equipos: {
          include: { proyectos: true }
        },
        participantes_invitaciones_equipo_enviada_por_participante_idToparticipantes: {
          include: { users: true }
        },
        perfiles: true
      }
    });

    // 4. Eventos
    const now = new Date();
    const eventosDisponiblesCount = equipo ? 0 : await prisma.eventos.count({
      where: { fecha_fin: { gte: now } }
    });

    const eventosProximos = await prisma.eventos.findMany({
      where: { fecha_fin: { gte: now } },
      orderBy: { fecha_inicio: 'asc' },
      take: 3
    });

    return {
      participante,
      equipo,
      esLider,
      proyecto,
      solicitudesPendientes,
      invitacionesPendientes,
      eventosDisponiblesCount,
      eventosProximos
    };
  }

  async registroInicial(userId: number, dto: RegistroInicialDto) {
    let participante = await this.findByUserId(userId);

    if (participante) {
      return prisma.participantes.update({
        where: { id: participante.id },
        data: {
          carrera_id: BigInt(dto.carrera_id),
          no_control: dto.no_control,
          telefono: dto.telefono,
          updated_at: new Date()
        }
      });
    }

    return prisma.participantes.create({
      data: {
        user_id: BigInt(userId),
        carrera_id: BigInt(dto.carrera_id),
        no_control: dto.no_control,
        telefono: dto.telefono,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async getCarreras() {
    return prisma.carreras.findMany({
      orderBy: { nombre: 'asc' }
    });
  }
}
