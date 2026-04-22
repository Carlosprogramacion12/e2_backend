<template>
  <AppLayout>
    <div class="view-header">
      <div class="header-main">
        <h2 class="view-title">Calendario de Eventos</h2>
      </div>
      <nav class="breadcrumb">
        <router-link to="/admin/dashboard" class="breadcrumb-item">Dashboard</router-link>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-active">Eventos</span>
      </nav>
    </div>

    <div v-if="msg" class="alert alert-success">{{ msg }}</div>

    <!-- Calendar Widget -->
    <CalendarWidget :eventos="eventos">
      <template #actions>
        <router-link to="/admin/eventos/crear" class="btn btn-indigo registrar-btn">
          <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Agregar Evento
        </router-link>
      </template>
    </CalendarWidget>

    <!-- Events Table -->
    <div class="table-container listado-container">
      <div class="listado-header">
        <h3 class="listado-title">Listado de Eventos</h3>
        <router-link to="/admin/eventos/crear" class="btn btn-indigo">
          <span class="mr-2">+</span> Agregar evento
        </router-link>
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
              <div class="evento-info-cell">
                <div class="evento-icon-rounded">
                  <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <div class="evento-nombre">{{ e.nombre }}</div>
                  <div class="evento-desc-muted">{{ e.descripcion }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="fechas-col">
                <span class="fecha-item"><span class="fecha-label-start">INICIO:</span> {{ fmtFull(e.fecha_inicio) }}</span>
                <span class="fecha-item"><span class="fecha-label-end">FIN:</span> {{ fmtFull(e.fecha_fin) }}</span>
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
              <div class="actions-cell">
                <!-- Ver Detalles -->
                <router-link :to="'/admin/eventos/' + e.id" class="action-btn-styled btn-blue-soft" title="Ver detalles">
                  <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </router-link>
                <!-- Editar -->
                <router-link 
                  v-if="getStatus(e) === 'upcoming'"
                  :to="'/admin/eventos/' + e.id + '/editar'" 
                  class="action-btn-styled btn-indigo-soft" 
                  title="Editar"
                >
                  <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </router-link>
                <div v-else class="action-btn-styled btn-disabled" title="No se puede editar un evento en curso o finalizado" style="opacity:0.4;cursor:not-allowed">
                  <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </div>

                <!-- Eliminar -->
                <button 
                  v-if="getStatus(e) === 'upcoming'"
                  @click="del(e.id)" 
                  class="action-btn-styled btn-red-soft" 
                  title="Eliminar"
                >
                  <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
                <div v-else class="action-btn-styled btn-disabled" title="No se puede eliminar un evento en curso o finalizado" style="opacity:0.4;cursor:not-allowed">
                  <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination -->
      <Pagination 
        v-model="page" 
        :total-pages="pagination.totalPages" 
        @update:model-value="fetch" 
      />
    </div>

  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import CalendarWidget from '../../components/CalendarWidget.vue'
import Pagination from '../../components/common/Pagination.vue'
import api from '../../plugins/axios'
import alerts from '../../services/alerts'

const eventos = ref([])
const loading = ref(true)
const showModal = ref(false)
const editing = ref(null)
const msg = ref('')

const page = ref(1)
const pagination = ref({
  total: 0,
  totalPages: 1
})

const fmtFull = d => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'

function getStatus(e) {
  const now = new Date()
  const start = new Date(e.fecha_inicio)
  const end = new Date(e.fecha_fin)
  if (now >= start && now <= end) return 'active'
  if (now < start) return 'upcoming'
  return 'finished'
}

async function fetch() {
  loading.value = true
  try {
    const res = await api.get('/admin/eventos', { params: { page: page.value } })
    const responseData = res.data.data || {}
    let list = responseData.eventos || []
    
    pagination.value = responseData.pagination || { total: list.length, totalPages: 1 }

    // Sort logic
    list.sort((a, b) => {
      const sA = getStatus(a)
      const sB = getStatus(b)
      
      const rank = { active: 1, upcoming: 2, finished: 3 }
      if (rank[sA] !== rank[sB]) {
        return rank[sA] - rank[sB]
      }
      return new Date(a.fecha_inicio) - new Date(b.fecha_inicio)
    })
    
    eventos.value = list
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function del(id) {
  if(!await alerts.confirmDelete('¿Estás seguro de eliminar este evento?')) return
  try {
    await api.delete(`/admin/eventos/${id}`)
    msg.value = 'Evento eliminado'
    setTimeout(() => msg.value='',3000)
    fetch()
  } catch(e) { console.error(e) }
}

onMounted(fetch)
</script>

<style scoped>
.view-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
.header-main { display: flex; flex-direction: column; gap: 1rem; }
.view-title { font-size: 1.875rem; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -0.025em; }

.breadcrumb { font-size: 0.875rem; color: var(--text-muted); display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem; }
.breadcrumb-item { color: inherit; text-decoration: none; transition: color 0.2s; }
.breadcrumb-item:hover { color: var(--indigo-600); }
.breadcrumb-sep { opacity: 0.5; }
.breadcrumb-active { color: var(--indigo-600); font-weight: 700; }
.dark .breadcrumb-active { color: var(--indigo-400); }

.listado-container { margin-top: 2.5rem; }
.listado-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); }
.listado-title { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -0.01em; }

.evento-info-cell { display: flex; align-items: center; gap: 1rem; }
.evento-icon-rounded { height: 2.5rem; width: 2.5rem; border-radius: 0.75rem; background: var(--indigo-50); display: flex; align-items: center; justify-content: center; color: var(--indigo-600); flex-shrink: 0; }
.dark .evento-icon-rounded { background: var(--bg-input); color: var(--indigo-400); }
.evento-nombre { font-weight: 700; color: var(--text-primary); }
.evento-desc-muted { font-size: 0.75rem; color: var(--text-muted); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.fechas-col { display: flex; flex-direction: column; gap: 0.25rem; }
.fecha-item { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
.fecha-label-start { font-weight: 800; color: var(--indigo-500); width: 45px; display: inline-block; }
.dark .fecha-label-start { color: var(--indigo-400); }
.fecha-label-end { font-weight: 800; color: var(--pink-500); width: 45px; display: inline-block; }
.dark .fecha-label-end { color: var(--pink-400); }

.actions-cell { display: flex; justify-content: flex-end; align-items: center; gap: 0.5rem; }
.action-btn-styled { padding: 0.5rem; border-radius: 0.75rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center; border: none; background: transparent; cursor: pointer; }
.btn-blue-soft { color: #2563eb; }
.btn-blue-soft:hover { background: #eff6ff; }
.dark .btn-blue-soft:hover { background: rgba(37, 99, 235, 0.1); }
.btn-indigo-soft { color: var(--indigo-600); }
.btn-indigo-soft:hover { background: var(--indigo-50); }
.dark .btn-indigo-soft:hover { background: var(--bg-input); }
.btn-red-soft { color: #dc2626; }
.btn-red-soft:hover { background: #fef2f2; }
.dark .btn-red-soft:hover { background: rgba(220, 38, 38, 0.1); color: #f87171; }

.status-badge { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.875rem; border-radius: 100px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
.status-active { background: var(--success-50); color: var(--success-700); border: 1px solid var(--success-100); }
.dark .status-active { background: rgba(34, 197, 94, 0.1); color: var(--success-400); border-color: rgba(34, 197, 94, 0.2); }
.status-upcoming { background: var(--indigo-50); color: var(--indigo-700); border: 1px solid var(--indigo-100); }
.dark .status-upcoming { background: rgba(59, 130, 246, 0.1); color: var(--indigo-400); border-color: rgba(59, 130, 246, 0.2); }
.status-finished { background: var(--card-muted); color: var(--text-muted); border: 1px solid var(--border-color); }

.status-dot { width: 0.375rem; height: 0.375rem; border-radius: 50%; }
.dot-green { background: var(--success-500); }
.dot-blue { background: var(--indigo-500); }

.icon-sm { width: 1.125rem; height: 1.125rem; }
.mr-2 { margin-right: 0.5rem; }
.registrar-btn { display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; }
</style>
