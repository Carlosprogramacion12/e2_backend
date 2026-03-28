import prisma from '../../utils/prisma';

export class ConstanciaRepository {
  async findAll() {
    return prisma.certificados.findMany({
      include: {
        user: true,
        evento: true,
      },
    });
  }

  async findById(id: number) {
    return prisma.certificados.findUnique({
      where: { id: BigInt(id) },
      include: { user: true, evento: true },
    });
  }

  async findByUser(userId: number, eventoId?: number) {
    const whereClause: any = { user_id: BigInt(userId) };
    if (eventoId) whereClause.evento_id = BigInt(eventoId);
    
    return prisma.certificados.findMany({
      where: whereClause,
      include: { evento: true },
    });
  }

  async create(data: any) {
    return prisma.certificados.create({
      data: {
        user_id: BigInt(data.user_id || data.participante_id),
        evento_id: BigInt(data.evento_id),
        tipo: data.tipo,
        archivo_path: data.archivo_path,
        codigo_qr: data.codigo_qr,
      },
    });
  }

  async delete(id: number) {
    return prisma.certificados.delete({
      where: { id: BigInt(id) },
    });
  }
}

