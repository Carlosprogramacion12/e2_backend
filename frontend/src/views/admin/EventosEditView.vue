<template>
  <AppLayout>
    <div style="max-width:48rem;margin:0 auto 1.5rem;display:flex;justify-content:space-between;align-items:center">
      <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary)">Editar Evento</h2>
      <nav style="font-size:.875rem;color:var(--text-muted);display:flex;gap:.5rem;align-items:center">
        <router-link to="/admin/dashboard" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Dashboard</router-link>
        <span>/</span>
        <router-link to="/admin/eventos" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Eventos</router-link>
        <span>/</span>
        <span style="color:#4f46e5;font-weight:600">Editar</span>
      </nav>
    </div>

    <!-- Main Container -->
    <div style="max-width:48rem;margin:0 auto;background:var(--card-bg,#fff);border:1px solid var(--border,#e5e7eb);border-radius:1rem;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);position:relative">
      
      <!-- Top Gradient Bar -->
      <div style="height:0.375rem;width:100%;background:linear-gradient(to right, #6366f1, #a855f7);"></div>
      
      <div style="padding:2rem">
        <div style="margin-bottom:2rem">
          <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary)">Información del Evento</h3>
          <p style="font-size:.875rem;color:var(--text-muted);margin-top:.25rem">Modifica los detalles del evento actual.</p>
        </div>

        <div v-if="fetching" style="padding:2rem;text-align:center;color:var(--text-muted)">Cargando datos...</div>
        <form v-else @submit.prevent="saveEvent" style="display:flex;flex-direction:column;gap:1.5rem">
          
          <!-- CHECKLIST DE LANZAMIENTO -->
          <div v-if="validacion" style="background:var(--card-muted);border:1px solid var(--border);border-radius:.75rem;padding:1.25rem;display:flex;flex-direction:column;gap:1rem">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <h4 style="font-size:.875rem;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:.5rem">
                <svg style="width:1.25rem;height:1.25rem;color:var(--indigo-500)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Estatus de Configuración
              </h4>
              <span v-if="validacion.listo_para_lanzar" style="font-size:.65rem;font-weight:800;text-transform:uppercase;background:#f0fdf4;color:#15803d;padding:2px 8px;border-radius:9999px;border:1px solid #86efac">Listo para Lanzar</span>
              <span v-else style="font-size:.65rem;font-weight:800;text-transform:uppercase;background:#fff7ed;color:#c2410c;padding:2px 8px;border-radius:9999px;border:1px solid #fdba74">Incompleto</span>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <!-- Jueces Status -->
              <div style="display:flex;align-items:center;gap:.75rem;background:var(--bg-card);padding:.75rem;border-radius:.5rem;border:1px solid var(--border)">
                <div :style="{ color: validacion.jueces_completos ? '#10b981' : '#f59e0b' }">
                  <svg style="width:1.25rem;height:1.25rem" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                </div>
                <div>
                  <p style="font-size:.7rem;font-weight:700;color:var(--text-muted);text-transform:uppercase">Panel de Jueces</p>
                  <p style="font-size:.875rem;font-weight:700;color:var(--text-primary)">{{ validacion.jueces_asignados }} / {{ validacion.max_jueces }} <span style="font-weight:400;color:var(--text-muted);font-size:.75rem">asignados</span></p>
                </div>
              </div>
              <!-- Rubrica Status -->
              <div style="display:flex;align-items:center;gap:.75rem;background:var(--bg-card);padding:.75rem;border-radius:.5rem;border:1px solid var(--border)">
                <div :style="{ color: validacion.rubrica_completa ? '#10b981' : '#f59e0b' }">
                  <svg style="width:1.25rem;height:1.25rem" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                </div>
                <div>
                  <p style="font-size:.7rem;font-weight:700;color:var(--text-muted);text-transform:uppercase">Rúbrica (Total)</p>
                  <p style="font-size:.875rem;font-weight:700;color:var(--text-primary)">{{ validacion.suma_ponderacion }}% / 100% <span style="font-weight:400;color:var(--text-muted);font-size:.75rem">configurado</span></p>
                </div>
              </div>
            </div>
            <p v-if="!validacion.listo_para_lanzar" style="font-size:.75rem;color:#c2410c;font-style:italic">
              * Nota: El evento no será visible para los participantes hasta que ambos indicadores estén completos.
            </p>
          </div>

          <!-- Error Alert -->
          <div v-if="error" class="alert alert-red" style="margin-bottom:1rem">{{ error }}</div>

          <!-- Started Blocking Banner -->
          <div v-if="isStarted && !fetching" style="margin-bottom:1.5rem;background:#fff7ed;border:1px solid #fed7aa;border-radius:.75rem;padding:1rem;display:flex;align-items:center;gap:1rem;color:#9a3412">
            <svg style="width:1.5rem;height:1.5rem;flex-shrink:0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <div style="font-size:.875rem;font-weight:600">
              Este evento ya ha comenzado y se encuentra bloqueado para edición. No puedes realizar cambios en la configuración ni en las fechas.
            </div>
          </div>

          <!-- Nombre -->
          <div>
            <label style="display:block;font-size:.875rem;font-weight:700;color:var(--text-primary);margin-bottom:.5rem">Nombre del Evento <span style="color:#ef4444">*</span></label>
            <div style="position:relative">
              <div style="position:absolute;left:0;top:0;bottom:0;width:2.5rem;display:flex;align-items:center;justify-content:center;color:var(--text-muted)">
                <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
              </div>
              <input v-model="form.nombre" type="text" style="width:100%;padding:.75rem 1rem .75rem 2.5rem;border-radius:.75rem;border:1px solid var(--border,#d1d5db);background:var(--input-bg,#fff);color:var(--text-primary);font-size:.875rem" required autofocus>
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
            <p style="font-size:.75rem;color:var(--text-muted);margin-top:.5rem">Ajusta la capacidad de evaluación para este evento.</p>
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
            <button type="submit" class="btn btn-indigo" :disabled="loading || isStarted" style="padding:.75rem 1.5rem;border-radius:.75rem;font-size:.875rem;box-shadow:0 4px 6px -1px rgba(79,70,229,.3)" :style="isStarted ? 'opacity:0.5;cursor:not-allowed' : ''">
              <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              {{ loading ? 'Guardando...' : (isStarted ? 'Bloqueado' : 'Guardar Cambios') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'

const router = useRouter()
const route = useRoute()
const eventId = route.params.id

const loading = ref(false)
const fetching = ref(true)
const error = ref('')
const validacion = ref(null)

const form = ref({
  nombre: '',
  descripcion: '',
  fecha_inicio: '',
  fecha_fin: '',
  max_jueces: 5
})

const isStarted = ref(false)

const minDateTime = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
})

const formatToLocalDatetime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  // Adjust for timezone offset to get local YYYY-MM-DDTHH:mm
  const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

onMounted(async () => {
  try {
    const res = await api.get(`/admin/eventos/${eventId}`)
    const ev = res.data.data
    form.value.nombre = ev.nombre
    form.value.descripcion = ev.descripcion || ''
    form.value.max_jueces = ev.max_jueces || 5
    // Format dates to local YYYY-MM-DDTHH:MM that datetime-local expects
    form.value.fecha_inicio = formatToLocalDatetime(ev.fecha_inicio)
    form.value.fecha_fin = formatToLocalDatetime(ev.fecha_fin)

    validacion.value = ev.validacion

    // Check if event has started
    if (new Date() >= new Date(ev.fecha_inicio)) {
        isStarted.value = true;
    }
  } catch (err) {
    error.value = 'No se pudo cargar el evento.'
  } finally {
    fetching.value = false
  }
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
    await api.put(`/admin/eventos/${eventId}`, payload)
    router.push('/admin/eventos')
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al actualizar el evento.'
  } finally {
    loading.value = false
  }
}
</script>
