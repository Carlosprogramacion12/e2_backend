import { SolicitudRepository } from './solicitud.repository';
import { CrearSolicitudDto } from './solicitud.types';

const solicitudRepository = new SolicitudRepository();

export class SolicitudService {
  async getMisSolicitudes(userId: number) {
    const p = await solicitudRepository.findParticipanteByUserId(userId);
    if (!p) throw { status: 404, message: 'Participante no encontrado' };

    const sols = await solicitudRepository.getMisSolicitudes(Number(p.id));
    return {
      success: true,
      data: sols.map(s => ({
        ...s,
        id: Number(s.id),
        equipo_id: Number(s.equipo_id),
        participante_id: Number(s.participante_id),
        perfil_solicitado_id: s.perfil_solicitado_id ? Number(s.perfil_solicitado_id) : null,
        equipo: s.equipos ? { ...s.equipos, id: Number(s.equipos.id) } : null,
        perfilSugerido: s.perfiles ? { ...s.perfiles, id: Number(s.perfiles.id) } : null
      }))
    };
  }

  async verSolicitudesEquipo(equipoId: number) {
    const sols = await solicitudRepository.getSolicitudesByEquipo(equipoId);
    return {
      success: true,
      data: sols.map(s => ({
        ...s,
        id: Number(s.id),
        equipo_id: Number(s.equipo_id),
        participante_id: Number(s.participante_id),
        perfil_solicitado_id: s.perfil_solicitado_id ? Number(s.perfil_solicitado_id) : null,
        participante: {
          id: Number(s.participantes_solicitudes_equipo_participante_idToparticipantes.id),
          user: { 
            name: s.participantes_solicitudes_equipo_participante_idToparticipantes.users.name,
            email: s.participantes_solicitudes_equipo_participante_idToparticipantes.users.email
          },
          carrera: s.participantes_solicitudes_equipo_participante_idToparticipantes.carreras ? {
            ...s.participantes_solicitudes_equipo_participante_idToparticipantes.carreras,
            id: Number(s.participantes_solicitudes_equipo_participante_idToparticipantes.carreras.id)
          } : null
        },
        perfilSugerido: s.perfiles ? { ...s.perfiles, id: Number(s.perfiles.id) } : null
      }))
    };
  }

  async crearSolicitud(equipoId: number, userId: number, dto: CrearSolicitudDto) {
    const p = await solicitudRepository.findParticipanteByUserId(userId);
    if (!p) throw { status: 404, message: 'Participante no encontrado' };

    const existente = await solicitudRepository.findPendiente(equipoId, Number(p.id));
    if (existente) throw { status: 400, message: 'Ya tienes solicitud pendiente.' };

    const solicitud = await solicitudRepository.crear(equipoId, Number(p.id), dto);
    return {
      success: true,
      message: 'Solicitud enviada.',
      data: {
        ...solicitud,
        id: Number(solicitud.id),
        equipo_id: Number(solicitud.equipo_id),
        participante_id: Number(solicitud.participante_id)
      }
    };
  }

  async aceptar(solicitudId: number, userId: number) {
    const solicitud = await solicitudRepository.findById(solicitudId);
    if (!solicitud || solicitud.estado !== 'pendiente') {
      throw { status: 400, message: 'Solicitud no válida.' };
    }

    const lider = await solicitudRepository.findParticipanteByUserId(userId);
    if (!lider) throw { status: 404, message: 'Participante (lider) no encontrado' };

    const perfilId = solicitud.perfil_solicitado_id ? Number(solicitud.perfil_solicitado_id) : 1;
    await solicitudRepository.aceptar(
      solicitudId,
      Number(solicitud.equipo_id),
      Number(solicitud.participante_id),
      perfilId,
      Number(lider.id)
    );

    return { success: true, message: 'Solicitud aceptada.' };
  }

  async rechazar(solicitudId: number, userId: number) {
    const solicitud = await solicitudRepository.findById(solicitudId);
    if (!solicitud) throw { status: 404, message: 'Solicitud no encontrada.' };

    const lider = await solicitudRepository.findParticipanteByUserId(userId);
    if (!lider) throw { status: 404, message: 'Participante (lider) no encontrado' };

    await solicitudRepository.rechazar(solicitudId, Number(lider.id));
    return { success: true, message: 'Solicitud rechazada.' };
  }
}
