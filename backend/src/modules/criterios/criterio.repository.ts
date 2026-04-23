import prisma from '../../prisma.config';
import { CreateCriterioDto, UpdateCriterioDto } from './criterio.types';

export class CriterioRepository {
  async findById(id: number) {
    return prisma.evaluacion_criterios.findUnique({
      where: { id: BigInt(id) },
      include: { eventos: true },
    });
  }

  async create(data: CreateCriterioDto) {
    return prisma.evaluacion_criterios.create({
      data: {
        evento_id: BigInt(data.evento_id),
        nombre: data.nombre,
        ponderacion: data.ponderacion,
      },
    });
  }

  async update(id: number, data: UpdateCriterioDto) {
    const updateData: any = {};
    if (data.nombre) updateData.nombre = data.nombre;
    if (data.ponderacion !== undefined) updateData.ponderacion = data.ponderacion;

    return prisma.evaluacion_criterios.update({
      where: { id: BigInt(id) },
      data: updateData,
    });
  }

  async delete(id: number) {
    return prisma.evaluacion_criterios.delete({
      where: { id: BigInt(id) },
    });
  }
}

