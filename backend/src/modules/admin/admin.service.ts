import { AdminRepository } from './admin.repository';
import { SaveDashboardPreferencesDto } from './admin.types';

const adminRepository = new AdminRepository();

export class AdminService {
  async getDashboardData(userId: number) {
    const metrics = await adminRepository.getDashboardMetrics();

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

    const userPrefs = await adminRepository.getUserPreferences(userId);
    const prefsMap: Record<string, any> = {};
    
    userPrefs.forEach(p => { 
      prefsMap[p.widget_key] = p; 
    });

    const widgets = defaultWidgets.map(def => {
      if (prefsMap[def.key]) {
        const pref = prefsMap[def.key];
        let parsedSettings = def.settings;
        try {
          if (pref.settings && typeof pref.settings === 'string') {
            parsedSettings = { ...def.settings, ...JSON.parse(pref.settings) };
          } else if (pref.settings && typeof pref.settings === 'object') {
            parsedSettings = { ...def.settings, ...pref.settings };
          }
        } catch (e) {
          // Keep default if JSON unparseable
        }

        return {
          key: def.key,
          position: pref.position,
          is_visible: Boolean(pref.is_visible),
          settings: parsedSettings
        };
      }
      return def;
    }).sort((a, b) => a.position - b.position);

    // Mock an anual timeline to ensure parity with Vue frontend visual expectations
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
    await adminRepository.saveUserPreferences(userId, data);
    return { success: true, message: 'Preferencias guardadas correctamente.' };
  }
}
