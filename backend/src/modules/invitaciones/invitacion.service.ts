import { InvitacionRepository } from './invitacion.repository';
import { CrearInvitacionDto } from './invitacion.types';
import { AppError } from '../../errors';




export class InvitacionService {
  constructor(private readonly invitacionRepository: InvitacionRepository = new InvitacionRepository()) {}

  async getMisInvitaciones(userId: number) {
    const invs = await this.invitacionRepository.getMisInvitaciones(userId);
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
    const invs = await this.invitacionRepository.getInvitacionesEnviadas(equipoId);
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
    const inv = await this.invitacionRepository.crear(equipoId, dto);
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
    const inv = await this.invitacionRepository.findById(invitacionId);
    if (!inv || inv.estado !== 'PENDIENTE') throw new AppError(400, 'Invitación no válida.');

    await this.invitacionRepository.aceptar(
      invitacionId,
      Number(inv.equipo_id),
      Number(inv.user_id)
    );

    return { success: true, message: 'Invitación aceptada.' };
  }

  async rechazar(invitacionId: number) {
    const inv = await this.invitacionRepository.findById(invitacionId);
    if (!inv) throw new AppError(404, 'Invitación no encontrada.');

    await this.invitacionRepository.rechazar(invitacionId);
    return { success: true, message: 'Invitación rechazada.' };
  }
}
