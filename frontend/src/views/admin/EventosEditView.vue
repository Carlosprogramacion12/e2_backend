<template>
  <AppLayout>
    <!-- No Header as requested -->

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
          <!-- Error Alert -->
          <div v-if="error" class="alert alert-red" style="margin-bottom:1rem">{{ error }}</div>

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
            <textarea v-model="form.descripcion" rows="4" style="width:100%;padding:1rem;border-radius:.75rem;border:1px solid var(--border,#d1d5db);background:var(--input-bg,#fff);color:var(--text-primary);font-size:.875rem;resize:vertical"></textarea>
          </div>

          <!-- SECCIÓN DE JUECES CON BUSCADOR MULTI-SELECT -->
          <div style="position:relative">
            <label style="display:block;font-size:.875rem;font-weight:700;color:var(--text-primary);margin-bottom:.5rem">Asignar Jueces</label>
            
            <!-- Lista de Jueces Seleccionados (Visual) -->
            <div style="margin-bottom:.75rem;display:flex;flex-wrap:wrap;gap:.5rem;min-height:2.5rem;padding:.5rem;background:#f9fafb;border-radius:.75rem;border:1px dashed var(--border,#d1d5db)">
              <div v-for="j in form.jueces" :key="j.id" style="display:flex;align-items:center;gap:.5rem;background:var(--card-bg,#fff);border:1px solid var(--border,#e5e7eb);padding:.25rem .25rem .25rem .5rem;border-radius:.5rem;box-shadow:0 1px 2px rgba(0,0,0,0.05)">
                <div style="width:1.25rem;height:1.25rem;border-radius:50%;background:#eef2ff;color:#4338ca;display:flex;align-items:center;justify-content:center;font-size:.625rem;font-weight:700">{{ j.name.charAt(0).toUpperCase() }}</div>
                <span style="font-size:.75rem;font-weight:500;color:var(--text-secondary)">{{ j.name }}</span>
                <button type="button" @click="form.jueces = form.jueces.filter(jj => jj.id !== j.id)" style="padding:.25rem;color:#9ca3af;background:transparent;border:none;cursor:pointer;border-radius:.25rem" class="hover:text-red-500 hover:bg-red-50">
                  <svg style="width:.75rem;height:.75rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div v-if="form.jueces.length === 0" style="width:100%;text-align:center;padding:.5rem 0">
                <span style="font-size:.75rem;color:var(--text-muted);font-style:italic">No hay jueces asignados aún.</span>
              </div>
            </div>

            <!-- Input Buscador -->
            <div style="position:relative">
              <div style="position:absolute;left:0;top:0;bottom:0;width:2.5rem;display:flex;align-items:center;justify-content:center;color:var(--text-muted)">
                <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input type="text" v-model="judgeSearch" placeholder="Buscar juez por nombre o correo..." style="width:100%;padding:.5rem 1rem .5rem 2.5rem;background:var(--card-bg,#fff);border:1px solid var(--border,#d1d5db);border-radius:.5rem;font-size:.875rem;color:var(--text-primary)">
            </div>

            <!-- Dropdown de Resultados -->
            <div v-if="judgeSearch.length > 0 && filteredJueces.length > 0" style="position:absolute;z-index:50;width:100%;margin-top:.25rem;background:var(--card-bg,#fff);border:1px solid var(--border,#f3f4f6);border-radius:.75rem;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);max-height:15rem;overflow-y:auto">
              <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column">
                <li v-for="j in filteredJueces" :key="j.id" @click="addJuez(j)" style="padding:.75rem 1rem;cursor:pointer;border-bottom:1px solid var(--border,#f3f4f6)" class="hover:bg-gray-50">
                  <div style="display:flex;align-items:center;gap:.75rem">
                    <div style="width:2rem;height:2rem;border-radius:50%;background:#eef2ff;display:flex;align-items:center;justify-content:center;color:#4f46e5;font-weight:700;font-size:.75rem">{{ j.name.charAt(0).toUpperCase() }}</div>
                    <div>
                      <div style="font-size:.875rem;font-weight:700;color:var(--text-primary)">{{ j.name }}</div>
                      <div style="font-size:.75rem;color:var(--text-muted)">{{ j.email }}</div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div v-if="judgeSearch.length > 0 && filteredJueces.length === 0" style="margin-top:.5rem;padding:.5rem;text-align:center;font-size:.75rem;color:var(--text-muted);background:#f9fafb;border-radius:.5rem;border:1px solid var(--border,#f3f4f6)">
              No se encontraron coincidencias.
            </div>
          </div>

          <!-- Fechas -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
            <div>
              <label style="display:block;font-size:.875rem;font-weight:700;color:var(--text-primary);margin-bottom:.5rem">Inicio (Fecha y Hora) <span style="color:#ef4444">*</span></label>
              <input v-model="form.fecha_inicio" type="datetime-local" style="width:100%;padding:.75rem 1rem;border-radius:.75rem;border:1px solid var(--border,#d1d5db);background:var(--input-bg,#fff);color:var(--text-primary);font-size:.875rem" required>
            </div>
            <div>
              <label style="display:block;font-size:.875rem;font-weight:700;color:var(--text-primary);margin-bottom:.5rem">Cierre (Fecha y Hora) <span style="color:#ef4444">*</span></label>
              <input v-model="form.fecha_fin" type="datetime-local" style="width:100%;padding:.75rem 1rem;border-radius:.75rem;border:1px solid var(--border,#d1d5db);background:var(--input-bg,#fff);color:var(--text-primary);font-size:.875rem" required>
            </div>
          </div>

          <!-- Actions -->
          <div style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--border,#f3f4f6);display:flex;justify-content:flex-end;gap:1.5rem;align-items:center">
            <router-link to="/admin/eventos" style="font-size:.875rem;font-weight:500;color:var(--text-muted);text-decoration:none" class="hover:text-gray-900">
              Descartar
            </router-link>
            <button type="submit" class="btn btn-indigo" :disabled="loading" style="padding:.75rem 1.5rem;border-radius:.75rem;font-size:.875rem;box-shadow:0 4px 6px -1px rgba(79,70,229,.3)">
              <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
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
import api from '../../services/api'

const router = useRouter()
const route = useRoute()
const eventId = route.params.id

const loading = ref(false)
const fetching = ref(true)
const error = ref('')

const judgeSearch = ref('')
const allJueces = ref([])

const form = ref({
  nombre: '',
  descripcion: '',
  fecha_inicio: '',
  fecha_fin: '',
  jueces: []
})

const filteredJueces = computed(() => {
  if (!judgeSearch.value) return []
  const q = judgeSearch.value.toLowerCase()
  return allJueces.value.filter(j => 
    (j.name.toLowerCase().includes(q) || j.email.toLowerCase().includes(q)) &&
    !form.value.jueces.find(sj => sj.id === j.id)
  )
})

function addJuez(j) {
  form.value.jueces.push(j)
  judgeSearch.value = ''
}

onMounted(async () => {
  try {
    const resJ = await api.get('/admin/eventos/jueces/disponibles')
    allJueces.value = resJ.data.data || []

    const res = await api.get(`/admin/eventos/${eventId}`)
    const ev = res.data.data
    form.value.nombre = ev.nombre
    form.value.descripcion = ev.descripcion || ''
    // Format dates to YYYY-MM-DDTHH:MM that datatime-local expects
    form.value.fecha_inicio = ev.fecha_inicio ? new Date(ev.fecha_inicio).toISOString().slice(0,16) : ''
    form.value.fecha_fin = ev.fecha_fin ? new Date(ev.fecha_fin).toISOString().slice(0,16) : ''
    form.value.jueces = ev.jueces || []
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
      jueces: form.value.jueces.map(j => j.id)
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
