<template>
  <AppLayout>
    <div style="margin-bottom:1.5rem">
      <h2 style="font-size:1.5rem;font-weight:700">Calendario de Eventos</h2>
    </div>

    <div v-if="msg" class="alert alert-success">{{ msg }}</div>

    <!-- Calendar Widget -->
    <CalendarWidget :eventos="eventos">
      <template #actions>
        <router-link to="/admin/eventos/crear" class="btn btn-indigo" style="text-decoration:none">
          <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Agregar Evento
        </router-link>
      </template>
    </CalendarWidget>

    <!-- Events Table (like Laravel's "Listado de Eventos") -->
    <div class="table-container" style="margin-top:2rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--border)">
        <h3 style="font-size:1.125rem;font-weight:700">Listado de Eventos</h3>
        <router-link to="/admin/eventos/crear" class="btn btn-indigo" style="text-decoration:none"><span>+</span> Agregar evento</router-link>
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
              <div style="display:flex;justify-content:flex-end;align-items:center;gap:.5rem">
                <!-- Ver Detalles -->
                <router-link :to="'/admin/eventos/' + e.id" style="padding:.5rem;border-radius:.5rem;color:#2563eb;transition:background-color .2s" class="hover:bg-blue-50 dark:hover:bg-blue-900/30" title="Ver detalles">
                  <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </router-link>
                <!-- Editar -->
                <router-link :to="'/admin/eventos/' + e.id + '/editar'" style="padding:.5rem;border-radius:.5rem;color:#4f46e5;transition:background-color .2s" class="hover:bg-indigo-50 dark:hover:bg-indigo-900/30" title="Editar">
                  <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </router-link>
                <!-- Eliminar -->
                <button @click="del(e.id)" style="padding:.5rem;border-radius:.5rem;color:#dc2626;background:transparent;border:none;cursor:pointer;transition:background-color .2s" class="hover:bg-red-50 dark:hover:bg-red-900/30" title="Eliminar">
                  <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
    const res = await api.get('/admin/eventos')
    eventos.value = res.data.data.eventos || res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function del(id) {
  if(!confirm('¿Estás seguro?')) return
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
