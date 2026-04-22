<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem">
      <div>
        <h2 style="font-size:1.5rem;font-weight:700">Editar Equipo</h2>
      </div>
      <nav style="font-size:.875rem;color:var(--text-muted);display:flex;gap:.5rem;align-items:center;margin-top:.25rem">
        <router-link to="/admin/dashboard" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Dashboard</router-link>
        <span>/</span>
        <router-link to="/admin/equipos" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Equipos</router-link>
        <span>/</span>
        <span style="color:#4f46e5;font-weight:600">Editar</span>
      </nav>
    </div>

    <div v-if="loading" style="padding:4rem;text-align:center"><div class="spinner"></div></div>

    <div v-else style="max-width:48rem;margin:0 auto">
      <div style="background:var(--card-bg,#fff);border-radius:1rem;border:1px solid var(--border,#e5e7eb);box-shadow:0 1px 2px rgba(0,0,0,0.05);overflow:hidden">
        
        <div style="height:.375rem;width:100%;background:linear-gradient(to right, #6366f1, #9333ea)"></div>

        <div style="padding:2rem">
          <div style="margin-bottom:2rem">
            <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary)">Renombrar Equipo</h3>
            <p style="font-size:.875rem;color:var(--text-muted);margin-top:.25rem">Modifica el identificador del equipo. Los miembros y el proyecto asociado se mantendrán intactos.</p>
          </div>

          <form @submit.prevent="save">
            <!-- Nombre del Equipo -->
            <div style="margin-bottom:1.5rem">
              <label style="display:block;margin-bottom:.5rem;font-weight:700;font-size:.875rem;color:var(--text-primary)">Nombre del Equipo</label>
              <div style="position:relative">
                <div style="position:absolute;top:0;bottom:0;left:0;padding-left:.75rem;display:flex;align-items:center;pointer-events:none;color:#9ca3af">
                  <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <input v-model="form.nombre" type="text" required
                       style="width:100%;padding:.75rem 1rem .75rem 2.5rem;border-radius:.75rem;border:1px solid var(--border,#e5e7eb);background:var(--input-bg,#f9fafb);font-size:.875rem;transition:all 0.2s">
              </div>
            </div>

            <!-- Alerta Informativa -->
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:.75rem;padding:1rem;display:flex;gap:.75rem;align-items:flex-start;margin-bottom:1.5rem">
              <svg style="width:1.25rem;height:1.25rem;color:#3b82f6;margin-top:.125rem;flex-shrink:0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p style="font-size:.75rem;color:#1d4ed8;line-height:1.5">
                Este cambio se reflejará inmediatamente en las constancias, el ranking y el panel de los jueces. Asegúrate de usar un nombre apropiado.
              </p>
            </div>

            <!-- Footer Actions -->
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:1rem;padding-top:1.5rem;border-top:1px solid var(--border,#f3f4f6)">
              <router-link to="/admin/equipos" style="font-size:.875rem;font-weight:500;color:#6b7280;text-decoration:none">
                Descartar
              </router-link>
              <button type="submit" :disabled="saving" class="btn btn-indigo flex items-center" style="padding:.75rem 1.5rem;border-radius:.75rem;box-shadow:0 4px 6px -1px rgba(99,102,241,0.3)">
                <svg v-if="!saving" style="width:1.25rem;height:1.25rem;margin-right:.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span style="font-weight:700">{{ saving ? 'Guardando...' : 'Guardar Cambios' }}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'
import alerts from '../../services/alerts'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const saving = ref(false)

const form = ref({
  nombre: ''
})

onMounted(async () => {
  try {
    const { data } = await api.get(`/admin/equipos/${route.params.id}`)
    form.value.nombre = data.data.nombre
  } catch (e) {
    alerts.error('Error al cargar')
    router.replace('/admin/equipos')
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  try {
    await api.put(`/admin/equipos/${route.params.id}`, form.value)
    router.push({ path: '/admin/equipos', query: { success: 'Equipo actualizado correctamente.' } })
  } catch (e) {
    alerts.error(e.response?.data?.message || 'Error al guardar')
  } finally {
    saving.value = false
  }
}
</script>
