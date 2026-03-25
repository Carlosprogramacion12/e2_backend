import prisma from '../../utils/prisma';
import { CrearInvitacionDto } from './invitacion.types';

export class InvitacionRepository {
  async findParticipanteByUserId(userId: number) {
    return prisma.participantes.findFirst({ where: { user_id: BigInt(userId) } });
  }

  async findParticipanteById(id: number) {
    return prisma.participantes.findUnique({ where: { id: BigInt(id) } });
  }

  async getMisInvitaciones(participanteId: number) {
    return prisma.invitaciones_equipo.findMany({
      where: { participante_id: BigInt(participanteId) },
      include: {
        equipos: {
          include: { proyectos: true }
        },
        participantes_invitaciones_equipo_enviada_por_participante_idToparticipantes: {
          include: { users: true }
        },
        perfiles: true
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getInvitacionesEnviadas(equipoId: number) {
    return prisma.invitaciones_equipo.findMany({
      where: { equipo_id: BigInt(equipoId) },
      include: {
        participantes_invitaciones_equipo_participante_idToparticipantes: {
          include: { users: true }
        },
        perfiles: true
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async crear(equipoId: number, enviadaPorId: number, dto: CrearInvitacionDto) {
    return prisma.invitaciones_equipo.create({
      data: {
        equipo_id: BigInt(equipoId),
        participante_id: BigInt(dto.participante_id),
        perfil_sugerido_id: dto.perfil_sugerido_id ? BigInt(dto.perfil_sugerido_id) : undefined,
        mensaje: dto.mensaje,
        estado: 'pendiente',
        enviada_por_participante_id: BigInt(enviadaPorId),
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async findById(id: number) {
    return prisma.invitaciones_equipo.findUnique({ where: { id: BigInt(id) } });
  }

  async aceptar(invitacionId: number, equipoId: number, participanteId: number, perfilId: number) {
    const ops = [
      prisma.invitaciones_equipo.update({
        where: { id: BigInt(invitacionId) },
        data: {
          estado: 'aceptada',
          respondida_en: new Date(),
          updated_at: new Date()
        }
      }),
      prisma.equipo_participante.create({
        data: {
          equipo_id: BigInt(equipoId),
          participante_id: BigInt(participanteId),
          perfil_id: BigInt(perfilId),
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    ];
    await prisma.$transaction(ops);
  }

  async rechazar(invitacionId: number) {
    return prisma.invitaciones_equipo.update({
      where: { id: BigInt(invitacionId) },
      data: {
        estado: 'rechazada',
        respondida_en: new Date(),
        updated_at: new Date()
      }
    });
  }
}
