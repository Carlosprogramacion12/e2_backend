import { ParticipanteRepository } from './participante.repository';
import { RegistroInicialDto } from './participante.types';
import { RankingService } from '../resultados/ranking.service';

const participanteRepository = new ParticipanteRepository();
const rankingService = new RankingService();

export class ParticipanteService {
  async getDashboardData(userId: number) {
    const rawData = await participanteRepository.getDashboardData(userId);
    
    if ('needsProfile' in rawData) {
      return { success: true, data: { needsProfile: true } };
    }

    const data = rawData as Exclude<typeof rawData, { needsProfile: boolean }>;

    let chartLabels: string[] = [];
    let chartData: number[] = [];
    let puntajeTotal = 0;
    let eventoFinalizado = false;

    if (data.proyecto && data.proyecto.eventos) {
      eventoFinalizado = new Date() > new Date(data.proyecto.eventos.fecha_fin);
      
      const res = await rankingService.calcularPuntajeProyecto(Number(data.proyecto.id));
      chartLabels = res.chartLabels;
      chartData = res.chartData;
      puntajeTotal = res.puntajeTotal;
    }

    const formatData = {
      equipo: data.equipo ? {
        ...data.equipo,
        id: Number(data.equipo.id)
      } : null,
      es_lider: data.esLider,
      proyecto: data.proyecto ? {
        ...data.proyecto,
        id: Number(data.proyecto.id),
        equipo_id: Number(data.proyecto.equipo_id),
        evento_id: Number(data.proyecto.evento_id)
      } : null,
      evento_inscrito: data.proyecto?.eventos ? {
        ...data.proyecto.eventos,
        id: Number(data.proyecto.eventos.id)
      } : null,
      evento_finalizado: eventoFinalizado,
      solicitudes_pendientes: data.solicitudesPendientes.map(s => ({
        ...s,
        id: Number(s.id),
        equipo_id: Number(s.equipo_id),
        participante_id: Number(s.participante_id),
        perfil_solicitado_id: s.perfil_solicitado_id ? Number(s.perfil_solicitado_id) : null,
        participante: {
          id: Number(s.participantes_solicitudes_equipo_participante_idToparticipantes.id),
          user: { name: s.participantes_solicitudes_equipo_participante_idToparticipantes.users.name },
          carrera: s.participantes_solicitudes_equipo_participante_idToparticipantes.carreras
        },
        perfilSugerido: s.perfiles
      })),
      invitaciones_pendientes: data.invitacionesPendientes.map(i => ({
        ...i,
        id: Number(i.id),
        equipo_id: Number(i.equipo_id),
        participante_id: Number(i.participante_id),
        equipo: {
          ...i.equipos,
          id: Number(i.equipos.id),
          proyecto: i.equipos.proyectos[0] ? { ...i.equipos.proyectos[0], id: Number(i.equipos.proyectos[0].id) } : null
        },
        enviadaPor: {
          user: { name: i.participantes_invitaciones_equipo_enviada_por_participante_idToparticipantes?.users.name }
        },
        perfilSugerido: i.perfiles
      })),
      eventos_disponibles_count: data.eventosDisponiblesCount,
      eventos_proximos: data.eventosProximos.map(e => ({ ...e, id: Number(e.id) })),
      chartLabels,
      chartData,
      puntajeTotal
    };

    return { success: true, data: formatData };
  }

  async getRegistroInicialDatos(userId: number) {
    const carreras = await participanteRepository.getCarreras();
    const participante = await participanteRepository.findByUserId(userId);

    return {
      success: true,
      data: {
        carreras: carreras.map(c => ({ ...c, id: Number(c.id) })),
        participante: participante ? {
          ...participante,
          id: Number(participante.id),
          user_id: Number(participante.user_id),
          carrera_id: Number(participante.carrera_id)
        } : null
      }
    };
  }

  async registroInicial(userId: number, dto: RegistroInicialDto) {
    const participante = await participanteRepository.registroInicial(userId, dto);
    return {
      success: true,
      message: 'Perfil registrado exitosamente.',
      data: {
        ...participante,
        id: Number(participante.id),
        user_id: Number(participante.user_id),
        carrera_id: Number(participante.carrera_id)
      }
    };
  }
}
