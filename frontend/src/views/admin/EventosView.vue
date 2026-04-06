<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 style="font-size:1.5rem;font-weight:700">Calendario de Eventos</h2>
    </div>

    <div v-if="msg" class="alert alert-success">{{ msg }}</div>

    <!-- Calendar Widget -->
    <CalendarWidget :eventos="eventos" />

    <!-- Events Table (like Laravel's "Listado de Eventos") -->
    <div class="table-container" style="margin-top:2rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--border)">
        <h3 style="font-size:1.125rem;font-weight:700">Listado de Eventos</h3>
        <button class="btn btn-indigo" @click="showModal=true"><span>+</span> Agregar evento</button>
      </div>

      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <table v-else>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Fechas</th>
            <th>Estado</th>
            <th style="text-align:right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in eventos" :key="e.id">
            <td>
              <div style="display:flex;align-items:center;gap:.75rem">
                <div style="height:2rem;width:2rem;border-radius:50%;background:#eef2ff;display:flex;align-items:center;justify-content:center;color:#4f46e5;flex-shrink:0">
                  <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <div style="font-weight:600">{{ e.nombre }}</div>
                  <div style="font-size:.75rem;color:#6b7280;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ e.descripcion }}</div>
                </div>
              </div>
            </td>
            <td>
              <div style="display:flex;flex-direction:column;gap:.25rem">
                <span style="font-size:.75rem"><span style="font-weight:700;color:#6366f1">INICIO:</span> {{ fmtFull(e.fecha_inicio) }}</span>
                <span style="font-size:.75rem"><span style="font-weight:700;color:#ec4899">FIN:</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {{ fmtFull(e.fecha_fin) }}</span>
              </div>
            </td>
            <td>
              <span v-if="getStatus(e)==='active'" class="status-badge status-active">
                <span class="status-dot dot-green"></span> En curso
              </span>
              <span v-else-if="getStatus(e)==='upcoming'" class="status-badge status-upcoming">
                <span class="status-dot dot-blue"></span> Próximo
              </span>
              <span v-else class="status-badge status-finished">
                Finalizado
              </span>
            </td>
            <td style="text-align:right">
              <div style="display:flex;justify-content:flex-end;gap:.5rem">
                <button class="action-icon" @click="edit(e)" title="Editar">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button class="action-icon danger" @click="del(e.id)" title="Eliminar">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content" style="max-width:32rem">
        <div class="modal-header">{{ editing?'Editar':'Nuevo' }} Evento <button class="modal-close" @click="close">✕</button></div>
        <div class="modal-body"><form @submit.prevent="save">
          <div class="form-group"><label>Nombre</label><input v-model="form.nombre" class="form-control" required></div>
          <div class="form-group"><label>Descripción</label><textarea v-model="form.descripcion" class="form-control"></textarea></div>
          <div style="display:flex;gap:1rem">
            <div class="form-group" style="flex:1"><label>Fecha Inicio</label><input v-model="form.fecha_inicio" type="date" class="form-control" required></div>
            <div class="form-group" style="flex:1"><label>Fecha Fin</label><input v-model="form.fecha_fin" type="date" class="form-control" required></div>
          </div>
          <button type="submit" class="btn btn-indigo btn-block">{{ editing?'Actualizar':'Crear' }}</button>
        </form></div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import CalendarWidget from '../../components/CalendarWidget.vue'
import api from '../../services/api'

const eventos = ref([])
const loading = ref(true)
const showModal = ref(false)
const editing = ref(null)
const msg = ref('')
const form = ref({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '' })

const fmtFull = d => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'

function getStatus(e) {
  const now = new Date()
  const start = new Date(e.fecha_inicio)
  const end = new Date(e.fecha_fin)
  if (now >= start && now <= end) return 'active'
  if (now < start) return 'upcoming'
  return 'finished'
}

async function fetchEventos() {
  loading.value = true
  try {
    const r = await api.get('/admin/eventos')
    eventos.value = r.data.data.eventos || r.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function edit(e) {
  editing.value = e
  form.value = {
    nombre: e.nombre,
    descripcion: e.descripcion || '',
    fecha_inicio: e.fecha_inicio?.split('T')[0] || '',
    fecha_fin: e.fecha_fin?.split('T')[0] || ''
  }
  showModal.value = true
}

function close() {
  showModal.value = false
  editing.value = null
  form.value = { nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '' }
}

async function save() {
  try {
    if (editing.value) await api.put(`/admin/eventos/${editing.value.id}`, form.value)
    else await api.post('/admin/eventos', form.value)
    close()
    msg.value = 'Evento guardado.'
    fetchEventos()
    setTimeout(() => msg.value = '', 3000)
  } catch (e) {
    alert(e.response?.data?.message || 'Error')
  }
}

async function del(id) {
  if (!confirm('¿Eliminar este evento?')) return
  try {
    await api.delete(`/admin/eventos/${id}`)
    msg.value = 'Evento eliminado.'
    fetchEventos()
    setTimeout(() => msg.value = '', 3000)
  } catch (e) {
    alert('Error')
  }
}

onMounted(fetchEventos)
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: .375rem;
  padding: .25rem .75rem;
  border-radius: 100px;
  font-size: .75rem;
  font-weight: 700;
}
.status-active {
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
  border: 1px solid rgba(22, 163, 74, 0.2);
}
.dark .status-active {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  border-color: rgba(34, 197, 94, 0.2);
}
.status-upcoming {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  border: 1px solid rgba(37, 99, 235, 0.2);
}
.dark .status-upcoming {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.2);
}
.status-finished {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.2);
}
.dark .status-finished {
  background: rgba(107, 114, 128, 0.15);
  color: #9ca3af;
  border-color: rgba(107, 114, 128, 0.25);
}
.status-dot {
  width: .375rem;
  height: .375rem;
  border-radius: 50%;
}
.dot-green { background: #22c55e; }
.dot-blue { background: #3b82f6; }
</style>
