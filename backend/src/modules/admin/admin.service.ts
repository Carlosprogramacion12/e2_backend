import { AdminRepository } from './admin.repository';
import { SaveDashboardPreferencesDto } from './admin.types';



export class AdminService {
  constructor(private readonly adminRepository: AdminRepository = new AdminRepository()) {}

  async getDashboardData(userId: number) {
    const metrics = await this.adminRepository.getDashboardMetrics();

    // Widget preferences default configuration
    const defaultWidgets = [
      { key: 'stats_users', position: 0, is_visible: true, settings: {} },
      { key: 'stats_equipos', position: 1, is_visible: true, settings: {} },
      { key: 'stats_proyectos', position: 2, is_visible: true, settings: {} },
      { key: 'stats_eventos', position: 3, is_visible: true, settings: {} },
      { key: 'chart_evaluacion', position: 4, is_visible: true, settings: { type: 'bar', event_id: null } },
      { key: 'chart_carreras', position: 5, is_visible: true, settings: { type: 'doughnut' } },
      { key: 'list_eventos', position: 6, is_visible: true, settings: {} },
      { key: 'chart_pendientes_anual', position: 7, is_visible: false, settings: { type: 'line' } },
      { key: 'chart_categorias', position: 8, is_visible: false, settings: { type: 'bar' } }
    ];

    // Get user prefs (array of widget overrides)
    const userPrefs = await this.adminRepository.getUserPreferences(userId);
    const prefsMap: Record<string, any> = {};
    
    if (Array.isArray(userPrefs)) {
      userPrefs.forEach((p: any) => {
        if (p.key) prefsMap[p.key] = p;
      });
    }

    const widgets = defaultWidgets.map(def => {
      if (prefsMap[def.key]) {
        const pref = prefsMap[def.key];
        return {
          key: def.key,
          position: pref.position ?? def.position,
          is_visible: pref.is_visible ?? def.is_visible,
          settings: { ...def.settings, ...(pref.settings || {}) }
        };
      }
      return def;
    }).sort((a, b) => a.position - b.position);

    // Mock annual timeline
    const pendientesAnual = {
      '2021': 12, '2022': 8, '2023': 15, '2024': 5, '2025': metrics.proyectosPendientes
    };

    return {
      success: true,
      data: {
        ...metrics,
        eventos_activos: metrics.eventos_activos.map((e) => ({ ...e, id: Number(e.id) })),
        widgets,
        pendientesAnual
      }
    };
  }

  async savePreferences(userId: number, data: SaveDashboardPreferencesDto) {
    await this.adminRepository.saveUserPreferences(userId, data);
    return { success: true, message: 'Preferencias guardadas correctamente.' };
  }
}
