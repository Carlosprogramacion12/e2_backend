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
    if (Number(data.ponderacion) <= 0) {
      throw { status: 400, message: 'La ponderación debe ser un número positivo.' };
    }

    // VALIDACIÓN: No se puede crear si el evento ya inició
    const evento = await prisma.eventos.findUnique({
      where: { id: BigInt(data.evento_id) }
    });
    if (!evento) throw { status: 404, message: 'Evento no encontrado' };
    if (new Date() >= new Date(evento.fecha_inicio)) {
      throw { status: 403, message: 'No se pueden añadir criterios a un evento que ya ha iniciado o terminado.' };
    }

    // Validate 100% cap
    const existingCriterios = await prisma.evaluacion_criterios.findMany({
      where: { evento_id: BigInt(data.evento_id) }
    });
    const sumaActual = existingCriterios.reduce((sum: number, c: any) => sum + Number(c.ponderacion), 0);
    if (sumaActual + Number(data.ponderacion) > 100) {
      throw { status: 400, message: `La suma total no puede exceder el 100%. Solo quedan ${100 - sumaActual}% disponibles.` };
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

    // VALIDACIÓN: No se puede editar si el evento ya inició
    const evento = await prisma.eventos.findUnique({
      where: { id: (criterio as any).evento_id }
    });
    if (evento && new Date() >= new Date(evento.fecha_inicio)) {
      throw { status: 403, message: 'No se pueden modificar criterios de un evento que ya ha iniciado o terminado.' };
    }

    if (data.ponderacion !== undefined) {
      if (Number(data.ponderacion) <= 0) {
        throw { status: 400, message: 'La ponderación debe ser un número positivo.' };
      }

      // Validate 100% cap (exclude self)
      const existingCriterios = await prisma.evaluacion_criterios.findMany({
        where: { evento_id: (criterio as any).evento_id }
      });
      const sumaOtros = existingCriterios
        .filter((c: any) => Number(c.id) !== id)
        .reduce((sum: number, c: any) => sum + Number(c.ponderacion), 0);
      
      if (sumaOtros + Number(data.ponderacion) > 100) {
        throw { status: 400, message: `La suma total no puede exceder el 100%. Solo quedan ${100 - sumaOtros}% disponibles.` };
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

    // VALIDACIÓN: No se puede borrar si el evento ya inició
    const evento = await prisma.eventos.findUnique({
      where: { id: (criterio as any).evento_id }
    });
    if (evento && new Date() >= new Date(evento.fecha_inicio)) {
      throw { status: 403, message: 'No se pueden eliminar criterios de un evento que ya ha iniciado o terminado.' };
    }

    await criterioRepository.delete(id);
    return { success: true, message: 'Criterio eliminado.' };
  }
}
