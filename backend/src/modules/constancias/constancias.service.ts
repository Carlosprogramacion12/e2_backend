import { ConstanciaRepository } from './constancias.repository';
import { RankingService } from '../resultados/ranking.service';
import prisma from '../../prisma.config';
import { AppError } from '../../errors';



const rankingService = new RankingService();

export class ConstanciaService {
  constructor(private readonly constanciaRepository: ConstanciaRepository = new ConstanciaRepository()) {}

  async getAllConstancias() {
    const constancias = await this.constanciaRepository.findAll();
    return {
      success: true,
      data: constancias.map((c: any) => ({
        ...c,
        id: Number(c.id),
        user_id: Number(c.user_id),
        participante_id: Number(c.user_id), // compatibilidad frontend
        evento_id: Number(c.evento_id),
        user: c.users ? { ...c.users, id: Number(c.users.id) } : null,
        evento: c.eventos ? { ...c.eventos, id: Number(c.eventos.id) } : null,
      })),
    };
  }

  async getConstanciaById(id: number) {
    const c = await this.constanciaRepository.findById(id);
    if (!c) throw new AppError(404, 'Constancia no encontrada');
    
    return {
      success: true,
      data: {
        ...c,
        id: Number(c.id),
        user_id: Number(c.user_id),
        participante_id: Number(c.user_id),
        evento_id: Number(c.evento_id),
        user: (c as any).users ? { ...(c as any).users, id: Number((c as any).users.id) } : null,
        evento: (c as any).eventos ? { ...(c as any).eventos, id: Number((c as any).eventos.id) } : null,
      },
    };
  }

  async getConstanciasByUser(userId: number, eventoId?: number) {
    // 1. Buscar constancias registradas físicamente
    const constanciasDB = await this.constanciaRepository.findByUser(userId, eventoId);
    
    // 2. Buscar participaciones dinámicas (fallback)
    // Si no hay constancias en la DB, buscamos todos los eventos FINALIZADOS donde participó
    const participaciones = await prisma.proyectos.findMany({
      where: {
        equipos: {
          equipo_miembros: {
            some: { user_id: BigInt(userId) }
          }
        },
        // No filtramos por fecha_fin para que aparezcan también los eventos en curso (bloqueados)
        ...(eventoId ? { evento_id: BigInt(eventoId) } : {})
      },
      include: {
        eventos: true
      }
    });

    // Mapear constancias de la DB
    const listDB = await Promise.all(constanciasDB.map(async (c: any) => {
      const ranking = await rankingService.calcularRanking(Number(c.evento_id));
      const pos = ranking.findIndex((r: any) => {
        // Encontrar el proyecto de este usuario en este evento
        return r.integrantes.some((inte: any) => Number(inte.user_id) === userId);
      }) + 1;
      
      return {
        ...c,
        id: Number(c.id),
        user_id: Number(c.user_id),
        participante_id: Number(c.user_id),
        evento_id: Number(c.evento_id),
        evento: c.eventos ? { ...c.eventos, id: Number(c.eventos.id) } : null,
        is_dynamic: false,
        posicion: pos > 0 ? pos : null,
        texto_logro: pos > 0 ? rankingService.getTextoLogro(pos) : 'PARTICIPACIÓN'
      };
    }));

    // Mapear constancias dinámicas (evitando duplicados si ya están en DB)
    const dbEventoIds = new Set(listDB.map(c => c.evento_id));
    const listDynamic = await Promise.all(participaciones
      .filter(p => p.eventos && !dbEventoIds.has(Number(p.eventos.id)))
      .map(async (p) => {
        const ranking = await rankingService.calcularRanking(Number(p.eventos!.id));
        const pos = ranking.findIndex((r: any) => r.id === Number(p.id)) + 1;
        
        return {
          id: `dyn-${p.id}`,
          user_id: userId,
          participante_id: userId,
          evento_id: Number(p.eventos!.id),
          tipo: 'PARTICIPACION',
          archivo_path: null,
          is_dynamic: true,
          evento: { ...p.eventos, id: Number(p.eventos!.id) },
          posicion: pos > 0 ? pos : null,
          texto_logro: pos > 0 ? rankingService.getTextoLogro(pos) : 'PARTICIPACIÓN'
        };
      }));

    return {
      success: true,
      data: [...listDB, ...listDynamic],
    };
  }
}

