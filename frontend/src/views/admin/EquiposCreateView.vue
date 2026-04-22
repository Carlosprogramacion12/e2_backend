<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem">
      <div>
        <h2 style="font-size:1.5rem;font-weight:700">Crear Nuevo Equipo</h2>
      </div>
      <nav style="font-size:.875rem;color:var(--text-muted);display:flex;gap:.5rem;align-items:center;margin-top:.25rem">
        <router-link to="/admin/dashboard" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Dashboard</router-link>
        <span>/</span>
        <router-link to="/admin/equipos" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Equipos</router-link>
        <span>/</span>
        <span style="color:#4f46e5;font-weight:600">Crear</span>
      </nav>
    </div>

    <div style="max-width:48rem;margin:0 auto">
      <div style="background:var(--card-bg,#fff);border-radius:1rem;border:1px solid var(--border,#e5e7eb);box-shadow:0 1px 2px rgba(0,0,0,0.05);overflow:hidden">
        
        <div style="height:.375rem;width:100%;background:linear-gradient(to right, #6366f1, #9333ea)"></div>

        <div style="padding:2rem">
          <div style="margin-bottom:2rem">
            <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary)">Registrar Equipo Manualmente</h3>
            <p style="font-size:.875rem;color:var(--text-muted);margin-top:.25rem">Crea un grupo vacío para asignar estudiantes posteriormente.</p>
          </div>

          <form @submit.prevent="save">
            <!-- Nombre del Equipo -->
            <div style="margin-bottom:1.5rem">
              <label style="display:block;margin-bottom:.5rem;font-weight:700;font-size:.875rem;color:var(--text-primary)">Nombre del Equipo</label>
              <div style="position:relative">
                <div style="position:absolute;top:0;bottom:0;left:0;padding-left:.75rem;display:flex;align-items:center;pointer-events:none;color:#9ca3af">
                  <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <input v-model="form.nombre" type="text" required placeholder="Ej. Alpha Team, Los Innovadores..."
                       style="width:100%;padding:.75rem 1rem .75rem 2.5rem;border-radius:.75rem;border:1px solid var(--border,#e5e7eb);background:var(--input-bg,#f9fafb);font-size:.875rem;transition:all 0.2s">
              </div>
            </div>

            <!-- Alerta Informativa -->
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:.75rem;padding:1rem;display:flex;gap:.75rem;align-items:flex-start;margin-bottom:1.5rem">
              <svg style="width:1.25rem;height:1.25rem;color:#3b82f6;margin-top:.125rem;flex-shrink:0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div>
                <h4 style="font-size:.75rem;font-weight:700;color:#1d4ed8;text-transform:uppercase;margin-bottom:.25rem">Siguiente Paso</h4>
                <p style="font-size:.75rem;color:#2563eb;line-height:1.5">
                  Al crear el equipo, serás redirigido automáticamente a la pantalla de <strong>Gestión de Miembros</strong> para agregar a los integrantes y asignar roles.
                </p>
              </div>
            </div>

            <!-- Footer Actions -->
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:1rem;padding-top:1.5rem;border-top:1px solid var(--border,#f3f4f6)">
              <router-link to="/admin/equipos" style="font-size:.875rem;font-weight:500;color:#6b7280;text-decoration:none">
                Cancelar
              </router-link>
              <button type="submit" :disabled="saving" class="btn btn-indigo flex items-center" style="padding:.75rem 1.5rem;border-radius:.75rem;box-shadow:0 4px 6px -1px rgba(99,102,241,0.3)">
                <span style="font-weight:700">{{ saving ? 'Guardando...' : 'Crear y Asignar' }}</span>
                <svg v-if="!saving" style="width:1rem;height:1rem;margin-left:.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'
import alerts from '../../services/alerts'

const router = useRouter()
const saving = ref(false)
const form = ref({
  nombre: '',
  max_programadores: 2,
  max_disenadores: 1,
  max_testers: 1
})

async function save() {
  saving.value = true
  try {
    const r = await api.post('/admin/equipos', form.value)
    // Redirige al show para gestionar miembros, según dice Laravel
    router.push({ path: `/admin/equipos/${r.data.data.id || r.data.data.equipo.id}` })
  } catch (e) {
    alerts.error(e.response?.data?.message || 'Error al guardar')
  } finally {
    saving.value = false
  }
}
</script>
