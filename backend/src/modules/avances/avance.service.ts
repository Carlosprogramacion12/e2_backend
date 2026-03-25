import { AvanceRepository } from './avance.repository';
import { StoreAvanceDto } from './avance.types';

const avanceRepository = new AvanceRepository();

export class AvanceService {
  async getAvances(userId: number) {
    const proyectoId = await avanceRepository.getProyectoIdByUser(userId);
    if (!proyectoId) throw { status: 400, message: 'No tienes proyecto.' };

    const avances = await avanceRepository.getAllByProyectoId(proyectoId);
    
    // Simulate legacy response which included the project info
    return {
      success: true,
      data: {
        proyecto: { id: proyectoId },
        avances: avances.map(a => ({
          ...a,
          id: Number(a.id),
          proyecto_id: Number(a.proyecto_id)
        }))
      }
    };
  }

  async storeAvance(userId: number, dto: StoreAvanceDto) {
    const proyectoId = await avanceRepository.getProyectoIdByUser(userId);
    if (!proyectoId) throw { status: 400, message: 'No tienes proyecto para registrar avances.' };

    const avance = await avanceRepository.create(proyectoId, dto);
    return {
      success: true,
      message: 'Avance registrado.',
      data: {
        ...avance,
        id: Number(avance.id),
        proyecto_id: Number(avance.proyecto_id)
      }
    };
  }

  async destroyAvance(id: number) {
    const avance = await avanceRepository.findById(id);
    if (!avance) throw { status: 404, message: 'Avance no encontrado' };

    await avanceRepository.destroy(id);
    return { success: true, message: 'Avance eliminado.' };
  }
}
