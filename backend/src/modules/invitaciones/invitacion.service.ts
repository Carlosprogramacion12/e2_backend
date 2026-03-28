import { InvitacionRepository } from './invitacion.repository';
import { CrearInvitacionDto } from './invitacion.types';

const invitacionRepository = new InvitacionRepository();

export class InvitacionService {
  async getMisInvitaciones(userId: number) {
    const invs = await invitacionRepository.getMisInvitaciones(userId);
    return {
      success: true,
      data: invs.map((i: any) => ({
        id: Number(i.id),
        equipo_id: Number(i.equipo_id),
        user_id: Number(i.user_id),
        tipo: i.tipo,
        estado: i.estado,
        mensaje: i.mensaje,
        equipo: i.equipos ? {
          id: Number(i.equipos.id),
          nombre: i.equipos.nombre,
          proyecto: i.equipos.proyectos[0] ? { ...i.equipos.proyectos[0], id: Number(i.equipos.proyectos[0].id) } : null
        } : null
      }))
    };
  }

  async getInvitacionesEnviadas(equipoId: number) {
    const invs = await invitacionRepository.getInvitacionesEnviadas(equipoId);
    return {
      success: true,
      data: invs.map((i: any) => ({
        id: Number(i.id),
        equipo_id: Number(i.equipo_id),
        user_id: Number(i.user_id),
        tipo: i.tipo,
        estado: i.estado,
        mensaje: i.mensaje,
        participante: i.users ? {
          id: Number(i.users.id),
          user: {
            name: i.users.name,
            email: i.users.email
          }
        } : null
      }))
    };
  }

  async enviarInvitacion(equipoId: number, userId: number, dto: CrearInvitacionDto) {
    const inv = await invitacionRepository.crear(equipoId, dto);
    return {
      success: true,
      message: 'Invitación enviada.',
      data: {
        id: Number(inv.id),
        equipo_id: Number(inv.equipo_id),
        user_id: Number(inv.user_id)
      }
    };
  }

  async aceptar(invitacionId: number) {
    const inv = await invitacionRepository.findById(invitacionId);
    if (!inv || inv.estado !== 'PENDIENTE') throw { status: 400, message: 'Invitación no válida.' };

    await invitacionRepository.aceptar(
      invitacionId,
      Number(inv.equipo_id),
      Number(inv.user_id)
    );

    return { success: true, message: 'Invitación aceptada.' };
  }

  async rechazar(invitacionId: number) {
    const inv = await invitacionRepository.findById(invitacionId);
    if (!inv) throw { status: 404, message: 'Invitación no encontrada.' };

    await invitacionRepository.rechazar(invitacionId);
    return { success: true, message: 'Invitación rechazada.' };
  }
}
