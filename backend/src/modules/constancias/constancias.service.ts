import { ConstanciaRepository } from './constancias.repository';

const constanciaRepository = new ConstanciaRepository();

export class ConstanciaService {
  async getAllConstancias() {
    const constancias = await constanciaRepository.findAll();
    return {
      success: true,
      data: constancias.map((c: any) => ({
        ...c,
        id: Number(c.id),
        participante_id: Number(c.participante_id),
        evento_id: Number(c.evento_id),
        participantes: c.participantes ? { ...c.participantes, id: Number(c.participantes.id), user_id: Number(c.participantes.user_id) } : null,
        eventos: c.eventos ? { ...c.eventos, id: Number(c.eventos.id) } : null,
      })),
    };
  }

  async getConstanciaById(id: number) {
    const c = await constanciaRepository.findById(id);
    if (!c) throw { status: 404, message: 'Constancia no encontrada' };
    
    return {
      success: true,
      data: {
        ...c,
        id: Number(c.id),
        participante_id: Number(c.participante_id),
        evento_id: Number(c.evento_id),
        participantes: c.participantes ? { ...c.participantes, id: Number(c.participantes.id), user_id: Number(c.participantes.user_id) } : null,
        eventos: c.eventos ? { ...c.eventos, id: Number(c.eventos.id) } : null,
      },
    };
  }

  async getConstanciasByParticipante(participanteId: number, eventoId?: number) {
    const constancias = await constanciaRepository.findByParticipante(participanteId, eventoId);
    return {
      success: true,
      data: constancias.map((c: any) => ({
        ...c,
        id: Number(c.id),
        participante_id: Number(c.participante_id),
        evento_id: Number(c.evento_id),
        eventos: c.eventos ? { ...c.eventos, id: Number(c.eventos.id) } : null,
      })),
    };
  }
}
