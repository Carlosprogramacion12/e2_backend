<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem">
      <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary)">Detalles del Evento</h2>
      <nav style="font-size:.875rem;color:var(--text-muted);display:flex;gap:.5rem;align-items:center">
        <router-link to="/admin/dashboard" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Dashboard</router-link>
        <span>/</span>
        <router-link to="/admin/eventos" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Eventos</router-link>
        <span>/</span>
        <span style="color:#4f46e5;font-weight:600">Detalles</span>
      </nav>
    </div>

    <div v-if="loading" style="padding:2rem;text-align:center;color:var(--text-muted)">Cargando detalles...</div>

    <div v-else-if="evento" style="display:grid;grid-template-columns:350px 1fr;gap:2rem;align-items:start">
      <!-- Columna Izquierda: Información y Jueces -->
      <div style="display:flex;flex-direction:column;gap:2rem">
        <!-- Card Información -->
        <div style="background:var(--card-bg,#fff);border:1px solid var(--border,#e5e7eb);border-radius:1rem;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
          <div style="padding:1.5rem;border-bottom:1px solid var(--border,#e5e7eb);background:#f9fafb">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem">
              <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary);line-height:1.2">{{ evento.nombre }}</h3>
              <span :style="{ backgroundColor: getStatusColor(evento).bg, color: getStatusColor(evento).text, border: '1px solid ' + getStatusColor(evento).border }" style="display:inline-flex;align-items:center;padding:.125rem .625rem;border-radius:9999px;font-size:.75rem;font-weight:700;white-space:nowrap">
                {{ getStatusLabel(evento) }}
              </span>
            </div>
          </div>

          <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1.5rem">
            <div>
              <label style="display:block;font-size:.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.25rem">Descripción</label>
              <p style="font-size:.875rem;color:var(--text-primary);line-height:1.6">{{ evento.descripcion || 'Sin descripción detallada.' }}</p>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div style="background:#f9fafb;padding:.75rem;border-radius:.75rem;border:1px solid var(--border,#e5e7eb)">
                <span style="display:block;font-size:.75rem;color:#6366f1;font-weight:700;text-transform:uppercase;margin-bottom:.25rem">Inicia</span>
                <span style="display:block;font-size:.875rem;font-weight:700;color:var(--text-primary)">{{ fmtDate(evento.fecha_inicio) }}</span>
              </div>
              <div style="background:#f9fafb;padding:.75rem;border-radius:.75rem;border:1px solid var(--border,#e5e7eb)">
                <span style="display:block;font-size:.75rem;color:#ef4444;font-weight:700;text-transform:uppercase;margin-bottom:.25rem">Termina</span>
                <span style="display:block;font-size:.875rem;font-weight:700;color:var(--text-primary)">{{ fmtDate(evento.fecha_fin) }}</span>
              </div>
            </div>

            <div>
              <router-link :to="'/admin/eventos/' + evento.id + '/editar'" class="btn btn-indigo" style="width:100%;justify-content:center;padding:.625rem;border-radius:.75rem;font-size:.875rem;box-shadow:0 4px 6px -1px rgba(79,70,229,.3)">
                <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Editar Información
              </router-link>
            </div>
          </div>
        </div>

        <!-- Card Jueces -->
        <div style="background:var(--card-bg,#fff);border:1px solid var(--border,#e5e7eb);border-radius:1rem;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
          <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--border,#e5e7eb);display:flex;justify-content:space-between;align-items:center;background:#f9fafb">
            <h3 style="font-size:1rem;font-weight:700;color:var(--text-primary)">Jueces Asignados</h3>
            <span style="background:#e0e7ff;color:#4338ca;font-size:.7rem;padding:.1rem .5rem;border-radius:9999px;font-weight:800">
              {{ (evento.jueces?.length || 0) }} / {{ evento.max_jueces || 5 }}
            </span>
          </div>
          
          <div style="padding:1.5rem">
            <!-- Selector de Jueces (Solo si no ha comenzado) -->
            <div v-if="!isLocked" style="margin-bottom:1.5rem">
              <div style="display:flex;flex-direction:column;gap:0.75rem">
                <select v-model="selectedJuezId" style="width:100%;padding:.625rem;border-radius:.5rem;border:1px solid #d1d5db;font-size:.875rem;outline:none;background:#fff">
                  <option value="">Seleccionar juez...</option>
                  <option v-for="j in availableJuecesFiltered" :key="j.id" :value="j.id">
                    {{ j.name }} ({{ j.email }})
                  </option>
                </select>
                <button @click="addJuez" :disabled="!selectedJuezId || addingJuez" class="btn btn-indigo" style="width:100%;justify-content:center;padding:.75rem">
                   <svg style="width:1.25rem;height:1.25rem;margin-right:0.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                   {{ addingJuez ? 'Procesando...' : 'Asignar Juez al Evento' }}
                </button>
              </div>
              <p v-if="juezError" style="color:#ef4444;font-size:.8rem;margin-top:.5rem;padding-left:.2rem;font-weight:600">{{ juezError }}</p>
            </div>

            <!-- Lista de Jueces -->
            <div v-if="!evento.jueces || evento.jueces.length === 0" style="text-align:center;padding:1.5rem;border:2px dashed #f3f4f6;border-radius:.75rem">
               <p style="color:#9ca3af;font-size:.75rem">No hay jueces asignados.</p>
            </div>
            <div v-else style="display:flex;flex-direction:column;gap:.75rem">
              <div v-for="j in evento.jueces" :key="j.id" 
                style="display:flex;justify-content:space-between;align-items:center;padding:.75rem;background:#f9fafb;border-radius:.75rem;border:1px solid #f3f4f6">
                <div style="display:flex;align-items:center;gap:.75rem">
                  <div style="width:2rem;height:2rem;border-radius:9999px;background:#eef2ff;color:#4f46e5;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800;border:1px solid #c7d2fe">
                    {{ j.name.charAt(0).toUpperCase() }}
                  </div>
                  <div style="display:flex;flex-direction:column">
                    <span style="font-size:.875rem;font-weight:700;color:var(--text-primary)">{{ j.name }}</span>
                    <span style="font-size:.7rem;color:var(--text-muted)">{{ j.email }}</span>
                  </div>
                </div>
                <button v-if="!isLocked" @click="removeJuez(j.id)" class="text-red-400 hover:text-red-600" style="padding:.25rem;transition:all .2s; border:none; background:transparent; cursor:pointer" title="Remover Juez">
                  <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Criterios -->
      <div style="background:var(--card-bg,#fff);border:1px solid var(--border,#e5e7eb);border-radius:1rem;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
        <div style="padding:1.5rem;border-bottom:1px solid var(--border,#e5e7eb);display:flex;justify-content:space-between;align-items:center;background:#f9fafb">
          <div>
            <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary)">Criterios de Evaluación</h3>
            <p style="font-size:.75rem;color:var(--text-muted)">Define la rúbrica para los jueces.</p>
          </div>
          <button v-if="!isLocked" @click="showCriterioForm = !showCriterioForm" class="btn btn-indigo btn-sm" style="text-transform:uppercase;font-size:.75rem;font-weight:700;padding:.5rem 1rem">
            {{ showCriterioForm ? 'Cancelar' : '+ Agregar Criterio' }}
          </button>
        </div>

        <div style="padding:1.5rem">
          <!-- Banner de Bloqueo de Rúbrica -->
          <div v-if="isLocked" style="margin-bottom:1.5rem;background:#fefce8;border:1px solid #fef08a;border-radius:.75rem;padding:1rem;display:flex;align-items:center;gap:1rem;color:#854d0e">
            <svg style="width:1.25rem;height:1.25rem;flex-shrink:0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            <p style="font-size:.8125rem;font-weight:700">Rúbrica Bloqueada: El evento ya ha iniciado o terminado. No se pueden realizar cambios en los criterios.</p>
          </div>

          <!-- Formulario Nuevo Criterio -->
          <div v-if="showCriterioForm" style="margin-bottom:2rem;background:#eef2ff;padding:1.25rem;border-radius:1rem;border:1px solid #c7d2fe;position:relative">
            <!-- Indicador animado -->
            <div style="position:absolute;top:0;right:0;margin-top:-.5rem;margin-right:-.5rem">
              <span style="display:flex;width:.75rem;height:.75rem">
                <span style="animation:ping 1s cubic-bezier(0,0,.2,1) infinite;position:absolute;display:inline-flex;width:100%;height:100%;border-radius:9999px;background:#a5b4fc;opacity:.75"></span>
                <span style="position:relative;display:inline-flex;width:.75rem;height:.75rem;border-radius:9999px;background:#6366f1"></span>
              </span>
            </div>

            <h4 style="font-size:.875rem;font-weight:700;color:#3730a3;margin-bottom:1rem;text-transform:uppercase;letter-spacing:.05em">Nuevo Criterio</h4>
            <form @submit.prevent="saveCriterio" style="display:flex;flex-wrap:wrap;gap:1rem;align-items:flex-end">
              <div style="flex:1;min-width:10rem">
                <label style="display:block;font-size:.75rem;font-weight:700;color:#6b7280;margin-bottom:.25rem">Nombre</label>
                <input v-model="criterioForm.nombre" type="text" placeholder="Ej. Innovación, Diseño..." required
                  style="width:100%;box-sizing:border-box;padding:.5rem .75rem;border-radius:.5rem;border:1px solid #d1d5db;font-size:.875rem;outline:none">
              </div>
              <div style="width:8rem">
                <label style="display:block;font-size:.75rem;font-weight:700;color:#6b7280;margin-bottom:.25rem">Peso (%) — Máx {{ disponible }}</label>
                <input v-model.number="criterioForm.ponderacion" type="number" :max="disponible" min="1" :placeholder="`Máx ${disponible}`" required
                  style="width:100%;box-sizing:border-box;padding:.5rem .75rem;border-radius:.5rem;border:1px solid #d1d5db;font-size:.875rem;outline:none">
              </div>
              <button type="submit" :disabled="savingCriterio"
                class="btn btn-indigo" style="padding:.5rem 1.5rem;border-radius:.5rem;font-size:.875rem">
                {{ savingCriterio ? 'Guardando...' : 'Guardar' }}
              </button>
            </form>
            <p v-if="criterioError" style="color:#dc2626;font-size:.8rem;margin-top:.5rem">{{ criterioError }}</p>
          </div>

          <!-- Donut / Stats -->
          <div style="display:flex;gap:2rem;margin-bottom:2rem;align-items:center;justify-content:center;padding:1rem;background:#f9fafb;border-radius:1rem;border:1px solid var(--border,#e5e7eb)">
            <div style="position:relative;width:6rem;height:6rem">
              <svg viewBox="0 0 100 100" style="width:100%;height:100%;transform:rotate(-90deg)">
                <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="transparent" style="color:#e5e7eb"></circle>
                <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="transparent"
                  stroke-dasharray="251.3"
                  :stroke-dashoffset="251.3 - (251.3 * sumaTotal) / 100"
                  stroke-linecap="round"
                  :style="{ color: disponible === 0 ? '#22c55e' : '#6366f1', transition: 'stroke-dashoffset 0.8s' }">
                </circle>
              </svg>
              <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:var(--text-primary)">{{ sumaTotal }}%</div>
            </div>
            <div>
              <h4 style="font-size:.875rem;font-weight:700;color:var(--text-primary)">Estado de la Rúbrica</h4>
              <p style="font-size:.75rem;color:var(--text-muted);margin-top:.25rem">
                <span v-if="disponible === 0" style="color:#16a34a;font-weight:700">¡Completa!</span>
                <span v-else style="color:#ca8a04;font-weight:700">Incompleta.</span>
                {{ disponible === 0 ? ' La suma de criterios es 100%. Todo listo para evaluar.' : ` Tienes un ${disponible}% disponible para asignar.` }}
              </p>
            </div>
          </div>

          <!-- Lista de Criterios -->
          <div v-if="criterios.length === 0" style="text-align:center;padding:3rem 0;border:2px dashed var(--border,#e5e7eb);border-radius:1rem">
            <div style="background:#f3f4f6;padding:.75rem;border-radius:50%;width:3rem;height:3rem;display:flex;align-items:center;justify-content:center;margin:0 auto .75rem">
              <svg style="width:1.5rem;height:1.5rem;color:#9ca3af" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h3 style="color:var(--text-primary);font-weight:700;font-size:.875rem">Sin Criterios</h3>
            <p style="color:var(--text-muted);font-size:.75rem;margin-top:.25rem">Este evento aún no tiene reglas de evaluación.</p>
          </div>

          <div v-else style="border-top:1px solid var(--border,#e5e7eb)">
            <div v-for="c in criterios" :key="c.id"
              style="padding:1rem;border-bottom:1px solid var(--border,#e5e7eb);transition:background .15s"
              class="hover:bg-gray-50">

              <!-- MODO VISTA -->
              <div v-if="editingId !== c.id" style="display:flex;align-items:center;gap:1rem">
                <div style="width:3rem;height:3rem;border-radius:.75rem;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.1rem;border:1px solid #e5e7eb;flex-shrink:0">
                  {{ c.ponderacion }}<span style="font-size:.6rem;vertical-align:super">%</span>
                </div>
                <div style="flex:1">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.35rem">
                    <h4 style="font-weight:700;color:var(--text-primary);font-size:.9rem">{{ c.nombre }}</h4>
                    <div v-if="!isLocked" style="display:flex;gap:.25rem">
                      <!-- Editar -->
                      <button @click="startEdit(c)" title="Editar" style="padding:.35rem;border-radius:.5rem;border:none;background:transparent;cursor:pointer;color:#9ca3af;transition:color .15s" class="hover:text-indigo-500">
                        <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <!-- Eliminar -->
                      <button @click="deleteCriterio(c.id)" title="Eliminar" style="padding:.35rem;border-radius:.5rem;border:none;background:transparent;cursor:pointer;color:#9ca3af;transition:color .15s" class="hover:text-red-500">
                        <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                  <div style="width:100%;height:.375rem;background:#f3f4f6;border-radius:9999px;overflow:hidden">
                    <div style="height:100%;background:#6366f1;border-radius:9999px;transition:width .8s" :style="{ width: c.ponderacion + '%' }"></div>
                  </div>
                </div>
              </div>

              <!-- MODO EDICIÓN (inline) -->
              <div v-else style="background:#eef2ff;border-radius:.75rem;padding:1rem;border:1px solid #c7d2fe">
                <h4 style="font-size:.75rem;font-weight:700;color:#3730a3;margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.05em">Editando Criterio</h4>
                <form @submit.prevent="saveEdit(c.id)" style="display:flex;flex-wrap:wrap;gap:.75rem;align-items:flex-end">
                  <div style="flex:1;min-width:10rem">
                    <label style="display:block;font-size:.75rem;font-weight:700;color:#6b7280;margin-bottom:.25rem">Nombre</label>
                    <input v-model="editForm.nombre" type="text" required
                      style="width:100%;box-sizing:border-box;padding:.5rem .75rem;border-radius:.5rem;border:1px solid #a5b4fc;font-size:.875rem;outline:none;background:#fff">
                  </div>
                  <div style="width:8rem">
                    <label style="display:block;font-size:.75rem;font-weight:700;color:#6b7280;margin-bottom:.25rem">Peso (%)</label>
                    <input v-model.number="editForm.ponderacion" type="number" min="1" max="100" required
                      style="width:100%;box-sizing:border-box;padding:.5rem .75rem;border-radius:.5rem;border:1px solid #a5b4fc;font-size:.875rem;outline:none;background:#fff">
                  </div>
                  <div style="display:flex;gap:.5rem">
                    <button type="submit" :disabled="savingEdit"
                      style="padding:.5rem 1.25rem;border-radius:.5rem;background:#4f46e5;color:#fff;font-size:.875rem;font-weight:700;border:none;cursor:pointer">
                      {{ savingEdit ? '...' : 'Actualizar' }}
                    </button>
                    <button type="button" @click="cancelEdit"
                      style="padding:.5rem 1rem;border-radius:.5rem;background:#e5e7eb;color:#374151;font-size:.875rem;font-weight:700;border:none;cursor:pointer">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'

const route = useRoute()
const evento = ref(null)
const criterios = ref([])
const loading = ref(true)
const showCriterioForm = ref(false)
const savingCriterio = ref(false)
const criterioError = ref('')
const criterioForm = ref({ nombre: '', ponderacion: '' })
const editingId = ref(null)
const editForm = ref({ nombre: '', ponderacion: 0 })
const savingEdit = ref(false)
const juezError = ref('')

// Gestión de Jueces
const availableJueces = ref([])
const selectedJuezId = ref('')
const addingJuez = ref(false)
const isLocked = computed(() => {
  if (!evento.value) return false
  const lbl = getStatusLabel(evento.value)
  return lbl === 'En Curso' || lbl === 'Finalizado'
})

const sumaTotal = computed(() => criterios.value.reduce((sum, c) => sum + Number(c.ponderacion), 0))
const disponible = computed(() => 100 - sumaTotal.value)

// Filtrar jueces disponibles que NO estén ya asignados
const availableJuecesFiltered = computed(() => {
  if (!evento.value || !evento.value.jueces) return availableJueces.value
  const assignedIds = evento.value.jueces.map(j => j.id)
  return availableJueces.value.filter(j => !assignedIds.includes(j.id))
})

const getStatusLabel = (e) => {
  const now = new Date()
  const start = new Date(e.fecha_inicio)
  const end = new Date(e.fecha_fin)
  if (now >= start && now <= end) return 'En Curso'
  if (now < start) return 'Próximo'
  return 'Finalizado'
}

const getStatusColor = (e) => {
  const lbl = getStatusLabel(e)
  if (lbl === 'En Curso') return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' }
  if (lbl === 'Próximo') return { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' }
  return { bg: '#f3f4f6', text: '#1f2937', border: '#e5e7eb' }
}

const fmtDate = (dString) => {
  if (!dString) return '-'
  return new Date(dString).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function fetchEvento() {
  try {
    const res = await api.get(`/admin/eventos/${route.params.id}`)
    const data = res.data.data
    evento.value = data
    criterios.value = (data.criterio_evaluacion || []).map(c => ({ ...c, id: Number(c.id), ponderacion: Number(c.ponderacion) }))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchAvailableJueces() {
  try {
    const res = await api.get('/admin/eventos/jueces/disponibles')
    availableJueces.value = res.data.data
  } catch (e) {
    console.error('Error fetching available judges:', e)
  }
}

async function addJuez() {
  if (!selectedJuezId.value) return
  
  if (evento.value.jueces && evento.value.jueces.length >= (evento.value.max_jueces || 5)) {
    juezError.value = `Capacidad máxima alcanzada (${evento.value.max_jueces || 5} jueces).`
    return
  }
  
  addingJuez.value = true
  juezError.value = ''
  try {
    await api.post(`/admin/eventos/${route.params.id}/jueces`, {
      userId: selectedJuezId.value
    })
    selectedJuezId.value = ''
    await fetchEvento()
  } catch (e) {
    juezError.value = e.response?.data?.message || 'Error al asignar el juez.'
  } finally {
    addingJuez.value = false
  }
}

async function removeJuez(juezId) {
  if (!confirm('¿Deseas remover a este juez del evento?')) return
  try {
    await api.delete(`/admin/eventos/${route.params.id}/jueces/${juezId}`)
    await fetchEvento()
  } catch (e) {
    alert(e.response?.data?.message || 'Error al remover el juez.')
  }
}

async function saveCriterio() {
  criterioError.value = ''
  if (criterioForm.value.ponderacion > disponible.value) {
    criterioError.value = `El peso no puede superar el ${disponible.value}% disponible.`
    return
  }
  savingCriterio.value = true
  try {
    await api.post(`/admin/eventos/${route.params.id}/criterios`, {
      nombre: criterioForm.value.nombre,
      ponderacion: Number(criterioForm.value.ponderacion)
    })
    criterioForm.value = { nombre: '', ponderacion: '' }
    showCriterioForm.value = false
    await fetchEvento()
  } catch (e) {
    criterioError.value = e.response?.data?.message || 'Error al guardar el criterio.'
  } finally {
    savingCriterio.value = false
  }
}

function startEdit(c) {
  editingId.value = c.id
  editForm.value = { nombre: c.nombre, ponderacion: c.ponderacion }
}

function cancelEdit() {
  editingId.value = null
  editForm.value = { nombre: '', ponderacion: 0 }
}

async function saveEdit(id) {
  savingEdit.value = true
  try {
    await api.put(`/admin/criterios/${id}`, {
      nombre: editForm.value.nombre,
      ponderacion: Number(editForm.value.ponderacion)
    })
    cancelEdit()
    await fetchEvento()
  } catch (e) {
    alert(e.response?.data?.message || 'Error al actualizar el criterio.')
  } finally {
    savingEdit.value = false
  }
}

async function deleteCriterio(id) {
  if (!confirm('¿Eliminar este criterio?')) return
  try {
    await api.delete(`/admin/criterios/${id}`)
    await fetchEvento()
  } catch (e) {
    alert(e.response?.data?.message || 'Error al eliminar el criterio.')
  }
}

onMounted(() => {
  fetchEvento()
  fetchAvailableJueces()
})
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  text-decoration: none;
}
.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}
.btn-indigo {
  background: #4f46e5;
  color: white;
}
.btn-indigo:hover {
  background: #4338ca;
}
.btn-indigo:disabled {
  background: #a5b4fc;
  cursor: not-allowed;
}

@keyframes ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
</style>
