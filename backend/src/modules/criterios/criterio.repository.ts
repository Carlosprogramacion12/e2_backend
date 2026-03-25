import prisma from '../../utils/prisma';
import { CreateCriterioDto, UpdateCriterioDto } from './criterio.types';

export class CriterioRepository {
  async findById(id: number) {
    return prisma.criterio_evaluacion.findUnique({
      where: { id: BigInt(id) },
      include: { eventos: true },
    });
  }

  async create(data: CreateCriterioDto) {
    return prisma.criterio_evaluacion.create({
      data: {
        evento_id: BigInt(data.evento_id),
        nombre: data.nombre,
        ponderacion: data.ponderacion,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async update(id: number, data: UpdateCriterioDto) {
    const updateData: any = { updated_at: new Date() };
    if (data.nombre) updateData.nombre = data.nombre;
    if (data.ponderacion !== undefined) updateData.ponderacion = data.ponderacion;

    return prisma.criterio_evaluacion.update({
      where: { id: BigInt(id) },
      data: updateData,
    });
  }

  async delete(id: number) {
    return prisma.criterio_evaluacion.delete({
      where: { id: BigInt(id) },
    });
  }
}
