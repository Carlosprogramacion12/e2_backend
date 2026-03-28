import prisma from '../../utils/prisma';
import { CrearInvitacionDto } from './invitacion.types';

export class InvitacionRepository {
  // Get pending invitations for a user
  async getMisInvitaciones(userId: number) {
    return prisma.equipo_interacciones.findMany({
      where: {
        user_id: BigInt(userId),
        tipo: 'INVITACION',
        estado: 'PENDIENTE'
      },
      include: {
        equipos: {
          include: { proyectos: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  // Get invitations sent by a team
  async getInvitacionesEnviadas(equipoId: number) {
    return prisma.equipo_interacciones.findMany({
      where: {
        equipo_id: BigInt(equipoId),
        tipo: 'INVITACION'
      },
      include: {
        users: { select: { id: true, name: true, email: true } }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async crear(equipoId: number, dto: CrearInvitacionDto) {
    return prisma.equipo_interacciones.create({
      data: {
        equipo_id: BigInt(equipoId),
        user_id: BigInt(dto.participante_id!),
        tipo: 'INVITACION',
        estado: 'PENDIENTE',
        mensaje: dto.mensaje || null,
        created_at: new Date()
      }
    });
  }

  async findById(id: number) {
    return prisma.equipo_interacciones.findUnique({
      where: { id: BigInt(id) }
    });
  }

  async aceptar(invitacionId: number, equipoId: number, userId: number) {
    return prisma.$transaction([
      prisma.equipo_interacciones.update({
        where: { id: BigInt(invitacionId) },
        data: {
          estado: 'ACEPTADA',
          respondido_en: new Date(),
        }
      }),
      prisma.equipo_miembros.create({
        data: {
          equipo_id: BigInt(equipoId),
          user_id: BigInt(userId),
          rol: 'PROGRAMADOR',
          created_at: new Date()
        }
      })
    ]);
  }

  async rechazar(invitacionId: number) {
    return prisma.equipo_interacciones.update({
      where: { id: BigInt(invitacionId) },
      data: {
        estado: 'RECHAZADA',
        respondido_en: new Date(),
      }
    });
  }
}
