<template>
  <AppLayout>
    <div class="page-container">
      <div class="page-header">
        <h2 class="title">Bitácora de Proyecto</h2>
        <p class="subtitle">Registra los hitos y avances diarios de tu equipo.</p>
      </div>

    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    
    <div v-else class="bitacora-grid">
      <!-- COLUMNA IZQUIERDA: Formulario de Nuevo Registro -->
      <div class="sidebar">
        <div class="card formal-card sticky-sidebar shadow-sm">
          <div class="card-header-formal">
            <div class="icon-box">
              <svg style="width:1.5rem;height:1.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </div>
            <div>
              <h3 class="card-title">{{ isEditing ? 'Editar Registro' : 'Nuevo Registro' }}</h3>
              <p class="card-subtitle">{{ isEditing ? 'Modifica los detalles del avance.' : 'Documenta el progreso diario.' }}</p>
            </div>
          </div>
          
          <div class="card-body formal-body">
            <form @submit.prevent="save" class="avance-form">
              <div class="form-group mb-4">
                <label class="formal-label">FECHA DE REGISTRO</label>
                <div class="display-box">
                  <svg style="width:1.125rem;height:1.125rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span>{{ displayDate }}</span>
                </div>
              </div>

              <div class="form-group mb-5">
                <label class="formal-label">DETALLES DEL AVANCE</label>
                <div class="textarea-wrapper">
                  <textarea 
                    v-model="form.descripcion" 
                    placeholder="Describe qué lograron hoy:&#10;• Módulos terminados&#10;• Errores corregidos&#10;• Decisiones tomadas..." 
                    class="formal-textarea" 
                    rows="5" 
                    required
                  ></textarea>
                </div>
              </div>

              <button type="submit" class="btn btn-publish" :disabled="saving">
                <div v-if="saving" class="spinner-white" style="width:1.25rem;height:1.25rem"></div>
                <template v-else>
                  <svg v-if="!isEditing" style="width:1.25rem;height:1.25rem;margin-right:0.75rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                  <svg v-else style="width:1.25rem;height:1.25rem;margin-right:0.75rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  <span>{{ isEditing ? 'Guardar Cambios' : 'Publicar Avance' }}</span>
                </template>
              </button>
              
              <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-cancel-edit">
                Cancelar edición
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- COLUMNA DERECHA: Línea de Tiempo -->
      <div class="main-content">
        <div class="timeline-section">
          <div class="timeline-header">
            <div class="header-left">
              <svg style="width:1.25rem;height:1.25rem;margin-right:0.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <h3 class="timeline-title">Línea de Tiempo</h3>
            </div>
            <p class="timeline-meta">Ordenado por fecha (Reciente primero)</p>
          </div>

          <!-- Estado Vacío -->
          <div v-if="!avances.length" class="empty-timeline-card">
            <div class="empty-circle">
              <svg style="width:2rem;height:2rem;color:#94a3b8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            </div>
            <h4 class="empty-title">Bitácora Vacía</h4>
            <p class="empty-desc">No hay registros aún. Usa el formulario de la izquierda para documentar su primer logro.</p>
          </div>

          <!-- Timeline Activa -->
          <div v-else class="timeline-track">
            <div v-for="a in avances" :key="a.id" class="timeline-item">
              <div class="item-visual">
                <div class="item-bubble">
                  <svg style="width:1rem;height:1rem" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                </div>
                <div class="item-line"></div>
              </div>
              <div class="item-body card shadow-timeline">
                <div class="item-header">
                  <div class="item-date-wrapper">
                    <span class="item-day-month">{{ getDayMonth(a.fecha) }}</span>
                    <span class="item-time-badge">{{ getTime(a.fecha) }}</span>
                  </div>
                  <div class="item-actions">
                    <button v-if="canDelete(a)" @click="startEdit(a)" class="btn-action-tiny btn-edit-tiny" title="Editar">
                      <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button v-if="canDelete(a)" @click="confirmDelete(a.id)" class="btn-action-tiny btn-delete-tiny" title="Eliminar">
                      <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
                <div class="item-text text-secondary">{{ a.descripcion }}</div>
              </div>
            </div>

            <!-- Inicio del Proyecto -->
            <div class="timeline-item footer-item">
              <div class="item-visual">
                <div class="item-dot-gray"></div>
              </div>
              <div class="footer-text">INICIO DEL PROYECTO</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'
import alerts from '../../services/alerts'
import { useAuthStore } from '../../stores/auth.store'

const route = useRoute()
const auth = useAuthStore()
const proyectoId = route.query.proyectoId || null
const avances = ref([])
const loading = ref(true)
const saving = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const form = ref({ descripcion: '' })

// Computed para mostrar la fecha estilo Laravel
const displayDate = computed(() => {
  const d = new Date()
  const options = { weekday: 'long', day: 'numeric', month: 'long' }
  const formatted = d.toLocaleDateString('es-ES', options)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
})

const getDayMonth = d => {
  if (!d) return ''
  const date = new Date(d)
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  const formatted = date.toLocaleDateString('es-ES', options)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

const getTime = d => {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

async function fetchAvances() {
  try {
    loading.value = true
    const params = {}
    if (proyectoId) params.proyectoId = proyectoId
    const r = await api.get('/participante/avances', { params })
    avances.value = r.data.data.avances || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function save() {
  try {
    saving.value = true
    if (isEditing.value) {
      await api.put(`/participante/avances/${editingId.value}`, {
        descripcion: form.value.descripcion
      })
      isEditing.value = false
      editingId.value = null
    } else {
      await api.post('/participante/avances', {
        descripcion: form.value.descripcion,
        proyectoId: proyectoId
      })
    }
    form.value.descripcion = ''
    await fetchAvances()
  } catch (e) {
    alerts.error(e.response?.data?.message || 'Error al guardar el registro.')
  } finally {
    saving.value = false
  }
}

function startEdit(a) {
  isEditing.value = true
  editingId.value = a.id
  form.value.descripcion = a.descripcion
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  isEditing.value = false
  editingId.value = null
  form.value.descripcion = ''
}

function canDelete(a) {
  // Solo el autor o el líder si quisiéramos implementarlo así
  return true 
}

async function confirmDelete(id) {
  if (!await alerts.confirmDelete('¿Estás seguro de eliminar este registro?')) return
  try {
    await api.delete(`/participante/avances/${id}`)
    await fetchAvances()
  } catch (e) {
    alerts.error('No se pudo borrar el registro.')
  }
}

onMounted(fetchAvances)
</script>

<style scoped>
.page-container { max-width: 1400px; margin: 0 auto; padding: 0 2rem; }
.page-header { margin-bottom: 1.5rem; padding-top: 1rem; }
.title { font-size: 2.25rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.04em; line-height: 1; }
.subtitle { color: var(--text-muted); font-size: 1rem; margin-top: 0.5rem; font-weight: 500; }

.bitacora-grid { display: grid; grid-template-columns: 290px 1fr; gap: 1.5rem; align-items: start; }
.sidebar { width: 100%; }
.main-content { min-width: 0; }

@media (max-width: 1024px) {
  .sidebar, .main-content { grid-column: span 12 / span 12; }
}

/* Sidebar Card */
.sidebar { width: 100%; align-self: flex-start; height: fit-content; }
.formal-card { 
  background: var(--bg-card); border-radius: 1rem; border: 1px solid var(--border-color); 
  overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); 
  height: auto !important; min-height: auto !important; 
  display: flex; flex-direction: column;
}
.formal-body { padding: 0 1rem 1rem 1rem; }
.card-header-formal { padding: 1rem 1rem 0.625rem; display: flex; align-items: center; gap: 0.75rem; }
.icon-box { width: 2.5rem; height: 2.5rem; background: var(--bg-card); border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: var(--indigo-500); border: 1px solid var(--border-color); }
.card-title { font-size: 1.125rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; line-height: 1; }
.card-subtitle { font-size: 0.7rem; color: var(--text-muted); font-weight: 600; margin-top: 0.2rem; }

.formal-label { display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); margin-bottom: 0.5rem; letter-spacing: 0.05em; }

.display-box { 
  display: flex; align-items: center; gap: 0.75rem; 
  padding: 0.75rem 1rem; background: var(--card-muted); 
  border-radius: 0.75rem; border: 1px solid var(--border-color);
  color: var(--text-secondary); font-weight: 700; font-size: 0.875rem;
}

.textarea-wrapper { border: 1.5px solid var(--border-color); border-radius: 1rem; overflow: hidden; transition: all 0.2s; }
.textarea-wrapper:focus-within { border-color: var(--indigo-500); box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }

.formal-textarea { 
  width: 100%; padding: 0.875rem; border: none; resize: none; 
  font-size: 0.9375rem; color: var(--text-primary); background: var(--bg-card);
  min-height: 120px; line-height: 1.5;
}
.formal-textarea:focus { outline: none; }
.formal-textarea::placeholder { color: #94a3b8; }

.btn-publish {
  width: 100%; height: 3rem; background: var(--indigo-600); color: white;
  border-radius: 0.75rem; font-weight: 700; font-size: 0.9rem;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
}
.btn-publish:hover { background: #4338ca; transform: translateY(-1px); box-shadow: 0 12px 20px -3px rgba(79, 70, 229, 0.4); }
.btn-publish:active { transform: translateY(0); }
.btn-publish:disabled { opacity: 0.7; cursor: not-allowed; }

/* Timeline Main */
.timeline-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2rem; padding: 1.25rem 0 0.5rem; border-bottom: 1px solid var(--border-color); }
.header-left { display: flex; align-items: center; color: var(--indigo-500); }
.timeline-title { font-size: 1.125rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary); }
.timeline-meta { font-size: 0.8125rem; color: var(--text-muted); font-weight: 700; }

/* Empty State */
.empty-timeline-card {
  padding: 5rem 2rem; border-radius: 1.5rem; border: 2px dashed var(--border-color);
  display: flex; flex-direction: column; align-items: center; text-align: center;
  background: var(--card-muted);
}
.empty-circle { width: 4.5rem; height: 4.5rem; background: var(--bg-card); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; border: 1px solid var(--border-color); }
.empty-title { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.75rem; }
.empty-desc { font-size: 0.9375rem; color: var(--text-muted); max-width: 320px; line-height: 1.6; }

/* Timeline Track */
.timeline-track { display: flex; flex-direction: column; padding-left: 0.5rem; margin-top: 1rem; }
.timeline-item { display: flex; gap: 2rem; }
.item-visual { display: flex; flex-direction: column; align-items: center; width: 2.5rem; flex-shrink: 0; }
.item-bubble { 
  width: 2rem; height: 2rem; background: var(--bg-card); border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; 
  color: var(--indigo-500); border: 1px solid var(--border-color); z-index: 10; margin-top: 0.2rem;
  position: relative; box-shadow: 0 2px 4px -1px rgba(79, 70, 229, 0.1);
}
/* La "colita" de la burbuja que apunta a la tarjeta */
.item-bubble::after {
  content: ''; position: absolute; right: -8px; top: 50%; transform: translateY(-50%);
  border-top: 6px solid transparent; border-bottom: 6px solid transparent;
  border-left: 8px solid #f1f5f9; /* Color similar al borde de la tarjeta o del fondo */
  display: none; /* Empezaremos ocultándola si no queda perfecta, pero lo intentaremos con un pseudo-elemento de fondo */
}
.item-line { flex-grow: 1; width: 2px; background: var(--border-color); margin-top: 0; margin-bottom: 0; }
.timeline-item:last-child .item-line { display: none; }

.item-body { 
  flex-grow: 1; padding: 0.75rem 1rem; margin-bottom: 1.25rem; border-radius: 0.75rem;
  transition: all 0.2s; border: 1px solid var(--border-color); background: var(--bg-card);
  position: relative; box-shadow: 0 2px 8px -4px rgba(0, 0, 0, 0.05);
}
.item-body::before {
  content: ''; position: absolute; left: -8px; top: 0.625rem;
  border-top: 6px solid transparent; border-bottom: 6px solid transparent;
  border-right: 8px solid var(--bg-card); z-index: 5;
}
.item-body::after {
  content: ''; position: absolute; left: -9px; top: 0.625rem;
  border-top: 6px solid transparent; border-bottom: 6px solid transparent;
  border-right: 9px solid var(--border-color); z-index: 4;
}
.item-body:hover { transform: translateX(5px); border-color: #e0e7ff; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); }

.item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.item-date-wrapper { display: flex; align-items: center; gap: 1rem; }
.item-day-month { font-size: 0.9375rem; font-weight: 800; color: var(--text-primary); }
.item-time-badge { background: var(--border-color); color: var(--text-primary); font-size: 0.65rem; font-weight: 800; padding: 0.125rem 0.625rem; border-radius: 4px; text-transform: uppercase; border: 1px solid var(--border-color); }

.item-actions { display: flex; gap: 0.25rem; }
.btn-action-tiny { background: none; border: none; color: #cbd5e1; cursor: pointer; padding: 0.5rem; border-radius: 0.625rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.btn-edit-tiny:hover { color: var(--indigo-500); background: var(--card-muted); }
.btn-delete-tiny:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

.btn-cancel-edit { 
  width: 100%; margin-top: 0.75rem; background: none; border: none; 
  color: #64748b; font-size: 0.8125rem; font-weight: 700; cursor: pointer;
  text-decoration: underline; transition: color 0.2s;
}
.btn-cancel-edit:hover { color: #1e293b; }

.item-text { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; white-space: pre-wrap; }

/* Footer Item */
.footer-item { margin-top: -1rem; margin-bottom: 2rem; }
.item-dot-gray { width: 0.75rem; height: 0.75rem; background: var(--border-color); border-radius: 50%; margin-top: 0.25rem; }
.footer-text { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase; padding-top: 0.125rem; }

.spinner-white { border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.spinner { animation: spin 1s linear infinite; border-top-color: transparent !important; }
</style>
