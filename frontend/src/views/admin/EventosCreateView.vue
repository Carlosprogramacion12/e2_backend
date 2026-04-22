<template>
  <AppLayout>
    <div style="max-width:48rem;margin:0 auto 1.5rem;display:flex;justify-content:space-between;align-items:center">
      <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary)">Nuevo Evento</h2>
      <nav style="font-size:.875rem;color:var(--text-muted);display:flex;gap:.5rem;align-items:center">
        <router-link to="/admin/dashboard" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Dashboard</router-link>
        <span>/</span>
        <router-link to="/admin/eventos" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Eventos</router-link>
        <span>/</span>
        <span style="color:#4f46e5;font-weight:600">Crear</span>
      </nav>
    </div>

    <!-- Main Container matching Laravel create -->
    <div style="max-width:48rem;margin:0 auto;background:var(--card-bg,#fff);border:1px solid var(--border,#e5e7eb);border-radius:1rem;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);position:relative">
      
      <!-- Top Gradient Bar -->
      <div style="height:0.375rem;width:100%;background:linear-gradient(to right, #4ade80, #3b82f6);"></div>
      
      <div style="padding:2rem">
        <div style="margin-bottom:2rem">
          <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary)">Registrar Evento</h3>
          <p style="font-size:.875rem;color:var(--text-muted);margin-top:.25rem">Crea una nueva convocatoria para hackathons o concursos.</p>
        </div>

        <form @submit.prevent="saveEvent" style="display:flex;flex-direction:column;gap:1.5rem">
          <!-- Error Alert -->
          <div v-if="error" class="alert alert-red" style="margin-bottom:1rem">{{ error }}</div>

          <!-- Nombre -->
          <div>
            <label style="display:block;font-size:.875rem;font-weight:700;color:var(--text-primary);margin-bottom:.5rem">Nombre del Evento <span style="color:#ef4444">*</span></label>
            <div style="position:relative">
              <div style="position:absolute;left:0;top:0;bottom:0;width:2.5rem;display:flex;align-items:center;justify-content:center;color:var(--text-muted)">
                <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
              </div>
              <input v-model="form.nombre" type="text" style="width:100%;padding:.75rem 1rem .75rem 2.5rem;border-radius:.75rem;border:1px solid var(--border,#d1d5db);background:var(--input-bg,#fff);color:var(--text-primary);font-size:.875rem" placeholder="Ej: Hackathon 2025" required autofocus>
            </div>
          </div>

          <!-- Descripción -->
          <div>
            <label style="display:block;font-size:.875rem;font-weight:700;color:var(--text-primary);margin-bottom:.5rem">Descripción</label>
            <textarea v-model="form.descripcion" rows="4" style="width:100%;padding:1rem;border-radius:.75rem;border:1px solid var(--border,#d1d5db);background:var(--input-bg,#fff);color:var(--text-primary);font-size:.875rem;resize:vertical" placeholder="Detalles sobre el evento..."></textarea>
          </div>

          <!-- CAPACIDAD DE JUECES -->
          <div>
            <label style="display:block;font-size:.875rem;font-weight:700;color:var(--text-primary);margin-bottom:.5rem">Capacidad de Jueces <span style="color:#ef4444">*</span></label>
            <div style="position:relative">
              <div style="position:absolute;left:0;top:0;bottom:0;width:2.5rem;display:flex;align-items:center;justify-content:center;color:var(--text-muted)">
                <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <select v-model="form.max_jueces" style="width:100%;padding:.75rem 1rem .75rem 2.5rem;border-radius:.75rem;border:1px solid var(--border,#d1d5db);background:var(--input-bg,#fff);color:var(--text-primary);font-size:.875rem;appearance:none" required>
                <option :value="3">3 Jueces (Mínimo)</option>
                <option :value="5">5 Jueces (Estándar)</option>
                <option :value="10">10 Jueces (Máximo)</option>
              </select>
              <div style="position:absolute;right:1rem;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--text-muted)">
                <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <p style="font-size:.75rem;color:var(--text-muted);margin-top:.5rem">Define cuántos jueces evaluarán cada proyecto en este evento.</p>
          </div>


          <!-- Fechas -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
            <div>
              <label style="display:block;font-size:.875rem;font-weight:700;color:var(--text-primary);margin-bottom:.5rem">Inicio (Fecha y Hora) <span style="color:#ef4444">*</span></label>
              <input v-model="form.fecha_inicio" type="datetime-local" :min="minDateTime" style="width:100%;padding:.75rem 1rem;border-radius:.75rem;border:1px solid var(--border,#d1d5db);background:var(--input-bg,#fff);color:var(--text-primary);font-size:.875rem" required>
            </div>
            <div>
              <label style="display:block;font-size:.875rem;font-weight:700;color:var(--text-primary);margin-bottom:.5rem">Cierre (Fecha y Hora) <span style="color:#ef4444">*</span></label>
              <input v-model="form.fecha_fin" type="datetime-local" :min="form.fecha_inicio || minDateTime" style="width:100%;padding:.75rem 1rem;border-radius:.75rem;border:1px solid var(--border,#d1d5db);background:var(--input-bg,#fff);color:var(--text-primary);font-size:.875rem" required>
            </div>
          </div>

          <!-- Actions -->
          <div style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--border,#f3f4f6);display:flex;justify-content:flex-end;gap:1.5rem;align-items:center">
            <router-link to="/admin/eventos" style="font-size:.875rem;font-weight:500;color:var(--text-muted);text-decoration:none" class="hover:text-gray-900">
              Descartar
            </router-link>
            <button type="submit" class="btn btn-indigo" :disabled="loading" style="padding:.75rem 1.5rem;border-radius:.75rem;font-size:.875rem;box-shadow:0 4px 6px -1px rgba(79,70,229,.3)">
              <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              {{ loading ? 'Creando...' : 'Crear Evento' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const form = ref({
  nombre: '',
  descripcion: '',
  fecha_inicio: '',
  fecha_fin: '',
  max_jueces: 5
})

const minDateTime = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
})

onMounted(async () => {
  // logic preserved if needed elsewhere
})


async function saveEvent() {
  error.value = ''
  
  if (new Date(form.value.fecha_inicio) >= new Date(form.value.fecha_fin)) {
    error.value = 'La fecha de fin debe ser posterior a la fecha de inicio.'
    return
  }

  loading.value = true
  try {
    const payload = {
      nombre: form.value.nombre,
      descripcion: form.value.descripcion,
      fecha_inicio: new Date(form.value.fecha_inicio).toISOString(),
      fecha_fin: new Date(form.value.fecha_fin).toISOString(),
      max_jueces: form.value.max_jueces
    }
    await api.post('/admin/eventos', payload)
    router.push('/admin/eventos')
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al crear el evento.'
  } finally {
    loading.value = false
  }
}
</script>
