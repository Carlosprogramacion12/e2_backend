import prisma from '../../utils/prisma';
import { CreateCarreraDto, UpdateCarreraDto } from './carrera.types';

export class CarreraRepository {
  async findAll() {
    return prisma.carreras.findMany({
      orderBy: { nombre: 'asc' }
    });
  }

  async findById(id: number) {
    return prisma.carreras.findUnique({
      where: { id: BigInt(id) }
    });
  }

  async create(data: CreateCarreraDto) {
    return prisma.carreras.create({
      data: {
        nombre: data.nombre,
        clave: data.clave,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async update(id: number, data: UpdateCarreraDto) {
    const updateData: any = { updated_at: new Date() };
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.clave !== undefined) updateData.clave = data.clave;

    return prisma.carreras.update({
      where: { id: BigInt(id) },
      data: updateData
    });
  }

  async delete(id: number) {
    return prisma.carreras.delete({
      where: { id: BigInt(id) }
    });
  }
}
