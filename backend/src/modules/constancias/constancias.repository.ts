import prisma from '../../utils/prisma';

export class ConstanciaRepository {
  async findAll() {
    return prisma.constancias.findMany({
      include: {
        participantes: true,
        eventos: true,
      },
    });
  }

  async findById(id: number) {
    return prisma.constancias.findUnique({
      where: { id: BigInt(id) },
      include: { participantes: true, eventos: true },
    });
  }

  async findByParticipante(participanteId: number, eventoId?: number) {
    const whereClause: any = { participante_id: BigInt(participanteId) };
    if (eventoId) whereClause.evento_id = BigInt(eventoId);
    
    return prisma.constancias.findMany({
      where: whereClause,
      include: { eventos: true },
    });
  }

  async create(data: any) {
    return prisma.constancias.create({
      data: {
        participante_id: BigInt(data.participante_id),
        evento_id: BigInt(data.evento_id),
        tipo: data.tipo,
        archivo_path: data.archivo_path,
        codigo_qr: data.codigo_qr,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async delete(id: number) {
    return prisma.constancias.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }
}
