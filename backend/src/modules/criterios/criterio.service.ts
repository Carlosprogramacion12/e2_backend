import { CriterioRepository } from './criterio.repository';
import { CreateCriterioDto, UpdateCriterioDto } from './criterio.types';
import prisma from '../../utils/prisma';

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
    // Validate 100% cap
    const existingCriterios = await prisma.evaluacion_criterios.findMany({
      where: { evento_id: BigInt(data.evento_id) }
    });
    const sumaActual = existingCriterios.reduce((sum: number, c: any) => sum + Number(c.ponderacion), 0);
    if (sumaActual + Number(data.ponderacion) > 100) {
      throw { status: 400, message: `Solo quedan ${100 - sumaActual}% disponibles para asignar.` };
    }

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

    // Validate 100% cap (exclude self)
    if (data.ponderacion !== undefined) {
      const existingCriterios = await prisma.evaluacion_criterios.findMany({
        where: { evento_id: (criterio as any).evento_id }
      });
      const sumaOtros = existingCriterios
        .filter((c: any) => Number(c.id) !== id)
        .reduce((sum: number, c: any) => sum + Number(c.ponderacion), 0);
      if (sumaOtros + Number(data.ponderacion) > 100) {
        throw { status: 400, message: `Solo quedan ${100 - sumaOtros}% disponibles (excluyendo este criterio).` };
      }
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
