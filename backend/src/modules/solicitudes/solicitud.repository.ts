import prisma from '../../utils/prisma';
import { CrearSolicitudDto } from './solicitud.types';

export class SolicitudRepository {
  async findParticipanteByUserId(userId: number) {
    return prisma.participantes.findFirst({ where: { user_id: BigInt(userId) } });
  }

  async getMisSolicitudes(participanteId: number) {
    return prisma.solicitudes_equipo.findMany({
      where: { participante_id: BigInt(participanteId) },
      include: {
        equipos: true,
        perfiles: true
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getSolicitudesByEquipo(equipoId: number) {
    return prisma.solicitudes_equipo.findMany({
      where: { equipo_id: BigInt(equipoId) },
      include: {
        participantes_solicitudes_equipo_participante_idToparticipantes: {
          include: { users: true, carreras: true }
        },
        perfiles: true
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async crear(equipoId: number, participanteId: number, dto: CrearSolicitudDto) {
    return prisma.solicitudes_equipo.create({
      data: {
        equipo_id: BigInt(equipoId),
        participante_id: BigInt(participanteId),
        perfil_solicitado_id: dto.perfil_solicitado_id ? BigInt(dto.perfil_solicitado_id) : undefined,
        mensaje: dto.mensaje,
        estado: 'pendiente',
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async findPendiente(equipoId: number, participanteId: number) {
    return prisma.solicitudes_equipo.findFirst({
      where: {
        equipo_id: BigInt(equipoId),
        participante_id: BigInt(participanteId),
        estado: 'pendiente'
      }
    });
  }

  async findById(id: number) {
    return prisma.solicitudes_equipo.findUnique({ where: { id: BigInt(id) } });
  }

  async aceptar(solicitudId: number, equipoId: number, solicitanteId: number, perfilId: number, jefeId: number) {
    const ops = [
      prisma.solicitudes_equipo.update({
        where: { id: BigInt(solicitudId) },
        data: {
          estado: 'aceptada',
          respondida_por_participante_id: BigInt(jefeId),
          respondida_en: new Date(),
          updated_at: new Date()
        }
      }),
      prisma.equipo_participante.create({
        data: {
          equipo_id: BigInt(equipoId),
          participante_id: BigInt(solicitanteId),
          perfil_id: BigInt(perfilId),
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    ];
    await prisma.$transaction(ops);
  }

  async rechazar(solicitudId: number, jefeId: number) {
    return prisma.solicitudes_equipo.update({
      where: { id: BigInt(solicitudId) },
      data: {
        estado: 'rechazada',
        respondida_por_participante_id: BigInt(jefeId),
        respondida_en: new Date(),
        updated_at: new Date()
      }
    });
  }
}
