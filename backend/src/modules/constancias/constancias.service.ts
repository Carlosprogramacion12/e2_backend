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
        user_id: Number(c.user_id),
        participante_id: Number(c.user_id), // compatibilidad frontend
        evento_id: Number(c.evento_id),
        user: c.user ? { ...c.user, id: Number(c.user.id) } : null,
        evento: c.evento ? { ...c.evento, id: Number(c.evento.id) } : null,
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
        user_id: Number(c.user_id),
        participante_id: Number(c.user_id),
        evento_id: Number(c.evento_id),
        user: (c as any).user ? { ...(c as any).user, id: Number((c as any).user.id) } : null,
        evento: (c as any).evento ? { ...(c as any).evento, id: Number((c as any).evento.id) } : null,
      },
    };
  }

  async getConstanciasByUser(userId: number, eventoId?: number) {
    const constancias = await constanciaRepository.findByUser(userId, eventoId);
    return {
      success: true,
      data: constancias.map((c: any) => ({
        ...c,
        id: Number(c.id),
        user_id: Number(c.user_id),
        participante_id: Number(c.user_id),
        evento_id: Number(c.evento_id),
        evento: c.evento ? { ...c.evento, id: Number(c.evento.id) } : null,
      })),
    };
  }
}

