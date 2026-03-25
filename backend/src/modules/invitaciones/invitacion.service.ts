import { InvitacionRepository } from './invitacion.repository';
import { CrearInvitacionDto } from './invitacion.types';

const invitacionRepository = new InvitacionRepository();

export class InvitacionService {
  async getMisInvitaciones(userId: number) {
    const p = await invitacionRepository.findParticipanteByUserId(userId);
    if (!p) throw { status: 404, message: 'Participante no encontrado' };

    const invs = await invitacionRepository.getMisInvitaciones(Number(p.id));
    return {
      success: true,
      data: invs.map(i => ({
        ...i,
        id: Number(i.id),
        equipo_id: Number(i.equipo_id),
        participante_id: Number(i.participante_id),
        perfil_sugerido_id: i.perfil_sugerido_id ? Number(i.perfil_sugerido_id) : null,
        equipo: i.equipos ? {
          ...i.equipos,
          id: Number(i.equipos.id),
          proyecto: i.equipos.proyectos[0] ? { ...i.equipos.proyectos[0], id: Number(i.equipos.proyectos[0].id) } : null
        } : null,
        enviadaPor: {
          user: { name: i.participantes_invitaciones_equipo_enviada_por_participante_idToparticipantes?.users.name }
        },
        perfilSugerido: i.perfiles ? { ...i.perfiles, id: Number(i.perfiles.id) } : null
      }))
    };
  }

  async getInvitacionesEnviadas(equipoId: number) {
    const invs = await invitacionRepository.getInvitacionesEnviadas(equipoId);
    return {
      success: true,
      data: invs.map(i => ({
        ...i,
        id: Number(i.id),
        equipo_id: Number(i.equipo_id),
        participante_id: Number(i.participante_id),
        perfil_sugerido_id: i.perfil_sugerido_id ? Number(i.perfil_sugerido_id) : null,
        participante: {
          id: Number(i.participantes_invitaciones_equipo_participante_idToparticipantes.id),
          user: {
            name: i.participantes_invitaciones_equipo_participante_idToparticipantes.users.name,
            email: i.participantes_invitaciones_equipo_participante_idToparticipantes.users.email
          }
        },
        perfilSugerido: i.perfiles ? { ...i.perfiles, id: Number(i.perfiles.id) } : null
      }))
    };
  }

  async enviarInvitacion(equipoId: number, userId: number, dto: CrearInvitacionDto) {
    const lider = await invitacionRepository.findParticipanteByUserId(userId);
    if (!lider) throw { status: 404, message: 'Participante local no encontrado' };

    const destino = await invitacionRepository.findParticipanteById(dto.participante_id);
    if (!destino) throw { status: 404, message: 'Usuario destino no encontrado' };

    const inv = await invitacionRepository.crear(equipoId, Number(lider.id), dto);
    return {
      success: true,
      message: 'Invitación enviada.',
      data: {
        ...inv,
        id: Number(inv.id),
        equipo_id: Number(inv.equipo_id),
        participante_id: Number(inv.participante_id)
      }
    };
  }

  async aceptar(invitacionId: number) {
    const inv = await invitacionRepository.findById(invitacionId);
    if (!inv || inv.estado !== 'pendiente') throw { status: 400, message: 'Invitación no válida.' };

    const perfilId = inv.perfil_sugerido_id ? Number(inv.perfil_sugerido_id) : 1;
    await invitacionRepository.aceptar(
      invitacionId,
      Number(inv.equipo_id),
      Number(inv.participante_id),
      perfilId
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
