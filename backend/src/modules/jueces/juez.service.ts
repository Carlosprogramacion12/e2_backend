import { JuezRepository } from './juez.repository';
import { StoreEvaluacionDto } from './juez.types';
import { AppError } from '../../errors';




export class JuezService {
  constructor(private readonly juezRepository: JuezRepository = new JuezRepository()) {}

  async getDashboardData(userId: number) {
    const eventos = await this.juezRepository.getDashboardData(userId);
    return { success: true, data: { eventos } };
  }

  async getEvento(eventoId: number, juezId: number) {
    const data = await this.juezRepository.getEvento(eventoId, juezId);
    if (!data) throw new AppError(404, 'Evento no encontrado');
    return { success: true, data };
  }


  async getEvaluacionData(proyectoId: number, juezId: number) {
    const data = await this.juezRepository.getEvaluacionData(proyectoId, juezId);
    if (!data) throw new AppError(404, 'Proyecto no encontrado');

    return { success: true, data };
  }

  async storeEvaluacion(proyectoId: number, juezId: number, dto: StoreEvaluacionDto) {
    await this.juezRepository.storeEvaluacion(proyectoId, juezId, dto);
    return { success: true, message: 'Evaluación guardada.' };
  }
}
