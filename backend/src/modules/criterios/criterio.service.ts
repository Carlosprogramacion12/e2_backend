import { CriterioRepository } from './criterio.repository';
import { CreateCriterioDto, UpdateCriterioDto } from './criterio.types';

const criterioRepository = new CriterioRepository();

export class CriterioService {
  async getCriterioById(id: number) {
    const criterio = await criterioRepository.findById(id);
    if (!criterio) {
      throw { status: 404, message: 'Criterio no encontrado' };
    }
    return {
      success: true,
      data: {
        ...criterio,
        id: Number(criterio.id),
        evento_id: Number(criterio.evento_id),
        ponderacion: Number(criterio.ponderacion),
        evento: criterio.eventos ? {
          ...criterio.eventos,
          id: Number(criterio.eventos.id)
        } : null
      },
    };
  }

  async createCriterio(data: CreateCriterioDto) {
    const criterio = await criterioRepository.create(data);
    return {
      success: true,
      message: 'Criterio creado.',
      data: {
        ...criterio,
        id: Number(criterio.id),
        evento_id: Number(criterio.evento_id),
        ponderacion: Number(criterio.ponderacion),
      },
    };
  }

  async updateCriterio(id: number, data: UpdateCriterioDto) {
    const criterio = await criterioRepository.findById(id);
    if (!criterio) {
      throw { status: 404, message: 'Criterio no encontrado' };
    }
    
    await criterioRepository.update(id, data);
    return { success: true, message: 'Criterio actualizado.' };
  }

  async deleteCriterio(id: number) {
    const criterio = await criterioRepository.findById(id);
    if (!criterio) {
      throw { status: 404, message: 'Criterio no encontrado' };
    }

    await criterioRepository.delete(id);
    return { success: true, message: 'Criterio eliminado.' };
  }
}
