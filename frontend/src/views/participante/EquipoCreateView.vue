<template>
  <AppLayout>
    <div class="py-12">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <form @submit.prevent="save">
          <!-- 1. Configuración del Equipo -->
          <div class="card card-section mb-6">
            <div class="card-header-muted">
              <h3 class="section-title">
                <svg class="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                1. Configuración del Equipo
              </h3>
            </div>
            <div class="card-body p-6 space-y-6">
              <div class="form-group">
                <label class="block text-sm font-medium label-standard">Evento al que participan</label>
                <select v-model="form.evento_id" class="form-control mt-1 block w-full" required>
                  <option value="">-- Selecciona el evento --</option>
                  <option v-for="e in eventos" :key="e.id" :value="e.id">
                    {{ e.nombre }} (Cierra: {{ formatShortDate(e.fecha_fin) }})
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="block text-sm font-medium label-standard">Nombre del Equipo</label>
                <input v-model="form.nombre" type="text" class="form-control mt-1 block w-full" required placeholder="Ej. Alpha Devs">
              </div>
            </div>
          </div>

          <!-- 2. Definición del Proyecto -->
          <div class="card card-section mb-6 border-t-4 border-indigo-500">
            <div class="card-header-muted">
              <h3 class="section-title">
                <svg class="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                2. Definición del Proyecto
              </h3>
              <p class="text-xs text-gray-500 mt-1" style="margin-left: 1.75rem;">Estos datos pueden editarse más adelante.</p>
            </div>
            <div class="card-body p-6 space-y-6">
              <div class="form-group">
                <label class="block text-sm font-medium label-standard">Título del Proyecto</label>
                <input v-model="form.proyecto_nombre" type="text" class="form-control mt-1 block w-full" required placeholder="Ej. Sistema de Riego IoT">
              </div>

              <div class="form-group">
                <label class="block text-sm font-medium label-standard">Descripción Breve</label>
                <textarea v-model="form.proyecto_descripcion" rows="4" class="form-control mt-1 block w-full" required placeholder="Describe el problema y tu solución..."></textarea>
              </div>

              <div class="form-group">
                <label class="block text-sm font-medium label-standard">Enlace al Repositorio (GitHub/GitLab)</label>
                <input v-model="form.repositorio_url" type="url" class="form-control mt-1 block w-full" placeholder="https://github.com/usuario/repo">
                <p class="text-xs text-gray-500 mt-1">Opcional. Puedes agregarlo más tarde.</p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-4 mt-8">
            <button type="button" @click="$router.push('/participante/dashboard')" class="btn-laravel-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-laravel-primary" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Registrar Todo' }}
            </button>
          </div>
        </form>
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
const eventos = ref([])
const saving = ref(false)
const form = ref({
  nombre: '',
  evento_id: '',
  proyecto_nombre: '',
  proyecto_descripcion: '',
  repositorio_url: ''
})

const formatShortDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`
}

onMounted(async () => {
  try {
    const r = await api.get('/participante/eventos-disponibles')
    eventos.value = r.data.data || []
    
    // Pre-select event if passed in query
    if (route.query.evento_id) {
      form.value.evento_id = Number(route.query.evento_id)
    }
  } catch (e) {
    console.error(e)
  }
})

async function save() {
  if (saving.value) return
  saving.value = true
  try {
    await api.post('/participante/equipos', form.value)
    router.push('/participante/dashboard')
  } catch (e) {
    alerts.error(e.response?.data?.message || 'Error al crear el equipo')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.form-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2rem;
  line-height: 1.25;
}

.card-section {
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
}

.card-header-muted {
  padding: 1.5rem;
  background: var(--card-muted, #f9fafb);
  border-bottom: 1px solid var(--border);
}

.label-standard {
  color: var(--text-secondary);
}

.btn-laravel-primary {
  background-color: var(--indigo-600);
  color: #fff;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-laravel-primary:hover {
  background-color: var(--indigo-700);
  transform: translateY(-1px);
}

.btn-laravel-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-laravel-secondary {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-laravel-secondary:hover {
  background-color: var(--card-muted);
  color: var(--text-primary);
}
</style>
