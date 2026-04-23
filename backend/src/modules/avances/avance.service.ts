import { AvanceRepository } from './avance.repository';
import { StoreAvanceDto } from './avance.types';
import { AppError } from '../../errors';




export class AvanceService {
  constructor(private readonly avanceRepository: AvanceRepository = new AvanceRepository()) {}

  private isEventoActive(evento: any): boolean {
    if (!evento || !evento[0]) return false;
    const now = new Date();
    const start = new Date(evento[0].fecha_inicio);
    const end = new Date(evento[0].fecha_fin);
    return now >= start && now <= end;
  }


  async getAvances(userId: number, proyectoIdParam?: number) {
    const proyectoId = await this.avanceRepository.getProyectoIdByUser(userId, proyectoIdParam);
    if (!proyectoId) throw new AppError(400, 'No tienes acceso a este proyecto o no existe.');

    const avances = await this.avanceRepository.getAllByProyectoId(proyectoId);
    const evento = await this.avanceRepository.getEventoByProyectoId(proyectoId);
    const is_evento_active = this.isEventoActive(evento);
    
    // Simulate legacy response which included the project info
    return {
      success: true,
      data: {
        proyecto: { id: proyectoId },
        is_evento_active,
        avances: avances.map(a => ({
          ...a,
          id: Number(a.id),
          proyecto_id: Number(a.proyecto_id)
        }))
      }
    };
  }

  async storeAvance(userId: number, dto: StoreAvanceDto, proyectoIdParam?: number) {
    const proyectoId = await this.avanceRepository.getProyectoIdByUser(userId, proyectoIdParam);
    if (!proyectoId) throw new AppError(400, 'No tienes proyecto seleccionado o acceso al mismo.');

    const evento = await this.avanceRepository.getEventoByProyectoId(proyectoId);
    if (!this.isEventoActive(evento)) throw new AppError(403, 'El evento no está activo. No se pueden registrar avances.');

    const avance = await this.avanceRepository.create(proyectoId, dto);
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
    const avance = await this.avanceRepository.findById(id);
    if (!avance) throw new AppError(404, 'Avance no encontrado');

    const evento = await this.avanceRepository.getEventoByProyectoId(Number(avance.proyecto_id));
    if (!this.isEventoActive(evento)) throw new AppError(403, 'El evento no está activo. No se pueden modificar avances.');

    await this.avanceRepository.destroy(id);
    return { success: true, message: 'Avance eliminado.' };
  }

  async updateAvance(id: number, dto: StoreAvanceDto) {
    const avance = await this.avanceRepository.findById(id);
    if (!avance) throw new AppError(404, 'Avance no encontrado');

    const evento = await this.avanceRepository.getEventoByProyectoId(Number(avance.proyecto_id));
    if (!this.isEventoActive(evento)) throw new AppError(403, 'El evento no está activo. No se pueden modificar avances.');

    // Se actualiza automáticamente a la hora actual al editar
    const now = new Date();
    const updated = await this.avanceRepository.update(id, dto.descripcion, now);
    return {
      success: true,
      message: 'Avance actualizado.',
      data: {
        ...updated,
        id: Number(updated.id),
        proyecto_id: Number(updated.proyecto_id)
      }
    };
  }
}
