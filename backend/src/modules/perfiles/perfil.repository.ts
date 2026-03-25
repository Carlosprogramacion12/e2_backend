import prisma from '../../utils/prisma';
import { CreatePerfilDto, UpdatePerfilDto } from './perfil.types';

export class PerfilRepository {
  async findAll() {
    return prisma.perfiles.findMany({
      orderBy: { nombre: 'asc' }
    });
  }

  async findById(id: number) {
    return prisma.perfiles.findUnique({
      where: { id: BigInt(id) }
    });
  }

  async create(data: CreatePerfilDto) {
    return prisma.perfiles.create({
      data: {
        nombre: data.nombre,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async update(id: number, data: UpdatePerfilDto) {
    const updateData: any = { updated_at: new Date() };
    if (data.nombre !== undefined) updateData.nombre = data.nombre;

    return prisma.perfiles.update({
      where: { id: BigInt(id) },
      data: updateData
    });
  }

  async delete(id: number) {
    return prisma.perfiles.delete({
      where: { id: BigInt(id) }
    });
  }
}
