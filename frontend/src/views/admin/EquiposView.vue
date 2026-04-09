<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <div style="display:flex;align-items:center;gap:1.5rem">
        <h2 style="font-size:1.5rem;font-weight:700">Supervisión de Equipos</h2>
        <router-link to="/admin/equipos/crear" class="btn btn-indigo" style="text-decoration:none;display:inline-flex;align-items:center;gap:0.5rem;padding:0.5rem 1rem;border-radius:0.5rem;font-size:0.75rem;text-transform:uppercase;font-weight:600">
          <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Registrar Equipo
        </router-link>
      </div>
      <nav style="font-size:.875rem;color:var(--text-muted);display:flex;gap:.5rem;align-items:center">
        <router-link to="/admin/dashboard" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Dashboard</router-link>
        <span>/</span>
        <span style="color:#4f46e5;font-weight:600">Equipos</span>
      </nav>
    </div>

    <!-- Success Message -->
    <div v-if="successMsg" class="alert alert-success" style="margin-bottom:1.5rem">
      <svg style="width:1.25rem;height:1.25rem;color:#34d399" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      {{ successMsg }}
    </div>

    <!-- Filtros -->
    <div style="background:var(--card-bg,#fff);padding:1rem;border-radius:1rem;box-shadow:0 1px 2px rgba(0,0,0,.05);border:1px solid var(--border,#e5e7eb);display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <div style="display:flex;align-items:center;gap:.5rem;color:var(--text-muted)">
        <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        <span style="font-size:.875rem;font-weight:700">Filtros Avanzados</span>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:.75rem;flex:1;justify-content:flex-end">
        <div style="position:relative;width:100%;max-width:16rem">
          <input type="text" v-model="search" placeholder="Buscar equipo..."
                 style="width:100%;padding:.5rem 1rem .5rem 2.5rem;border-radius:.75rem;border:1px solid var(--border,#e5e7eb);background:var(--input-bg,#f9fafb);font-size:.875rem">
          <svg style="width:1rem;height:1rem;position:absolute;left:.75rem;top:50%;transform:translateY(-50%);color:#9ca3af" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>

        <select v-model="eventoId" style="width:100%;max-width:12rem;padding:.5rem 1rem;border-radius:.75rem;border:1px solid var(--border,#e5e7eb);background:var(--input-bg,#f9fafb);font-size:.875rem">
          <option value="">Todos los eventos</option>
          <option v-for="ev in eventos" :key="ev.id" :value="ev.id">
            {{ ev.nombre }}
          </option>
        </select>

        <button @click="fetchData(1)" class="btn btn-indigo" style="padding:.5rem 1rem;border-radius:.75rem;font-size:.875rem">Aplicar</button>
        <button v-if="search || eventoId" @click="clearFilters" class="btn btn-white" style="padding:.5rem;border-radius:.75rem">
          <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div v-if="loading" style="padding:4rem;text-align:center"><div class="spinner"></div></div>
    
    <div v-else-if="equipos.length === 0" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5rem;background:var(--card-bg,#fff);border-radius:1rem;border:2px dashed var(--border,#e5e7eb)">
      <div style="background:#f3f4f6;padding:1rem;border-radius:50%;margin-bottom:1rem">
        <svg style="width:2.5rem;height:2.5rem;color:#9ca3af" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
      </div>
      <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary)">No se encontraron equipos</h3>
      <p style="font-size:.875rem;color:var(--text-muted);margin-top:.25rem;text-align:center;max-width:20rem">Intenta ajustar los filtros o crea un nuevo equipo.</p>
    </div>

    <div v-else>
      <div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:1.5rem">
        <div v-for="equipo in equipos" :key="equipo.id" class="team-card">
          <!-- Header -->
          <div style="padding:1.5rem;border-bottom:1px solid var(--border,#f3f4f6)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem">
              <div style="width:3rem;height:3rem;border-radius:.75rem;background:linear-gradient(to bottom right, #6366f1, #9333ea);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1.125rem;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)">
                {{ equipo.nombre.charAt(0).toUpperCase() }}
              </div>
              <div style="display:flex;gap:.5rem">
                <router-link :to="'/admin/equipos/' + equipo.id + '/editar'" class="action-btn" title="Editar">
                  <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </router-link>
                <button @click="deleteEquipo(equipo.id)" class="action-btn danger" title="Eliminar">
                  <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
            <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="equipo.nombre">
              {{ equipo.nombre }}
            </h3>
            <div style="margin-top:.5rem">
              <span v-if="equipo.proyecto && equipo.proyecto.evento" style="display:inline-flex;padding:.125rem .625rem;border-radius:9999px;font-size:.75rem;font-weight:600;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                {{ equipo.proyecto.evento.nombre }}
              </span>
              <span v-else style="display:inline-flex;padding:.125rem .625rem;border-radius:9999px;font-size:.75rem;font-weight:600;background:#f3f4f6;color:#4b5563;border:1px solid #e5e7eb">
                Sin Evento
              </span>
            </div>
          </div>

          <!-- Body: Miembros -->
          <div style="padding:1.5rem;flex:1;display:flex;flex-direction:column;justify-content:flex-end">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
              <span style="font-size:.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em">Miembros</span>
              <span style="font-size:.75rem;font-weight:700;color:var(--text-primary)">{{ equipo.participantes?.length || 0 }}</span>
            </div>
            
            <div style="display:flex;margin-left:.5rem">
              <template v-if="equipo.participantes && equipo.participantes.length > 0">
                <div v-for="(m, i) in equipo.participantes.slice(0,4)" :key="m.id" 
                     class="member-avatar" :title="m.user.name">
                  {{ m.user.name.charAt(0).toUpperCase() }}
                </div>
                <div v-if="equipo.participantes.length > 4" class="member-avatar more">
                  +{{ equipo.participantes.length - 4 }}
                </div>
              </template>
              <div v-else style="font-size:.75rem;color:var(--text-muted);font-style:italic;margin-left:-.5rem">
                Sin miembros
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background:var(--card-muted,#f9fafb);padding:1rem 1.5rem;border-top:1px solid var(--border,#f3f4f6)">
            <router-link :to="'/admin/equipos/' + equipo.id" class="manage-btn">
              Gestionar Equipo
            </router-link>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <Pagination 
        v-model="pagination.page" 
        :total-pages="pagination.totalPages" 
        @update:model-value="fetchData" 
      />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import Pagination from '../../components/common/Pagination.vue'
import api from '../../services/api'

const router = useRouter()
const route = useRoute()

const equipos = ref([])
const eventos = ref([])
const loading = ref(true)
const search = ref('')
const eventoId = ref('')
const successMsg = ref('')

const pagination = ref({ page: 1, limit: 9, totalPages: 1, total: 0 })

onMounted(() => {
  if (route.query.success) {
    successMsg.value = route.query.success
    setTimeout(() => successMsg.value = '', 3000)
    router.replace({ query: null })
  }
  fetchData()
})

async function fetchData(page = 1) {
  loading.value = true
  try {
    const params = { page, limit: 9 }
    if (search.value) params.search = search.value
    if (eventoId.value) params.evento_id = eventoId.value

    const r = await api.get('/admin/equipos', { params })
    equipos.value = r.data.data.equipos || r.data.data
    if (r.data.data.pagination) {
      pagination.value = r.data.data.pagination
    }
    
    // Load events for filter only once
    if (eventos.value.length === 0) {
      try {
        const eRes = await api.get('/admin/eventos', { params: { limit: 100 } })
        eventos.value = eRes.data.data.eventos || []
      } catch(e) {
        // ignore
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  search.value = ''
  eventoId.value = ''
  fetchData(1)
}

function goToPage(page) {
  if (page >= 1 && page <= pagination.value.totalPages) {
    fetchData(page)
  }
}

async function deleteEquipo(id) {
  if (!confirm('¿Eliminar equipo? Esta acción no se puede deshacer.')) return
  try {
    await api.delete(`/admin/equipos/${id}`)
    successMsg.value = 'Equipo eliminado exitosamente'
    fetchData(pagination.value.page)
    setTimeout(() => successMsg.value = '', 3000)
  } catch (e) {
    alert(e.response?.data?.message || 'Error al eliminar')
  }
}
</script>

<style scoped>
.team-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border, #f3f4f6);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.team-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
}

.action-btn {
  padding: .5rem;
  border-radius: .5rem;
  color: #9ca3af;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.action-btn:hover { color: #4f46e5; background: #e0e7ff; }
.action-btn.danger:hover { color: #dc2626; background: #fee2e2; }

.member-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #e5e7eb;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .75rem;
  font-weight: 700;
  border: 2px solid #fff;
  margin-left: -0.5rem;
  z-index: 1;
}
.member-avatar.more {
  background: #f3f4f6;
  color: #6b7280;
}

.manage-btn {
  display: block;
  width: 100%;
  text-align: center;
  padding: .5rem 1rem;
  background: var(--card-bg, #fff);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: .5rem;
  color: var(--text-secondary);
  font-size: .875rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.manage-btn:hover {
  background: #f9fafb;
  color: #4f46e5;
  border-color: #c7d2fe;
}

</style>
