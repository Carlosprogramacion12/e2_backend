<template>
  <AppLayout>
    <div class="view-header">
      <div class="header-main">
        <h2 class="view-title">Supervisión de Equipos</h2>
        <router-link to="/admin/equipos/crear" class="btn btn-indigo registrar-btn">
          <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Registrar Equipo
        </router-link>
      </div>
      <nav class="breadcrumb">
        <router-link to="/admin/dashboard" class="breadcrumb-item">Dashboard</router-link>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-active">Equipos</span>
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
    <!-- Filtros -->
    <div class="filters-panel">
      <div class="filters-label">
        <svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        <span class="label-text">Filtros Avanzados</span>
      </div>

      <div class="filters-actions">
        <div class="search-wrapper">
          <input type="text" v-model="search" placeholder="Buscar equipo..." class="form-control search-input-styled">
          <svg class="search-icon-abs" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>

        <select v-model="eventoId" @change="fetchData(1)" class="form-control event-select-styled">
          <option value="">Todos los eventos</option>
          <option v-for="ev in eventos" :key="ev.id" :value="ev.id">
            {{ ev.nombre }}
          </option>
        </select>

        <button v-if="search || eventoId" @click="clearFilters" class="btn btn-white clear-btn">
          <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div v-if="loading" style="padding:4rem;text-align:center"><div class="spinner"></div></div>
    
    <div v-else-if="equipos.length === 0" class="empty-state">
      <div class="empty-icon-container">
        <svg class="icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
      </div>
      <h3 class="empty-title">No se encontraron equipos</h3>
      <p class="empty-text">Intenta ajustar los filtros o registra un nuevo equipo.</p>
    </div>

    <div v-else>
      <div class="teams-grid">
        <div v-for="equipo in equipos" :key="equipo.id" class="team-card">
          <!-- Header -->
          <div class="team-card-header">
            <div class="header-top">
              <div class="team-avatar">
                {{ equipo.nombre.charAt(0).toUpperCase() }}
              </div>
              <div class="card-actions">
                <router-link :to="'/admin/equipos/' + equipo.id + '/editar'" class="action-btn" title="Editar">
                  <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </router-link>
                <button @click="deleteEquipo(equipo.id)" class="action-btn danger" title="Eliminar">
                  <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
            <h3 class="team-name" :title="equipo.nombre">
              {{ equipo.nombre }}
            </h3>
            <div class="event-badge-container">
              <span v-if="equipo.proyecto && equipo.proyecto.evento" class="event-badge">
                {{ equipo.proyecto.evento.nombre }}
              </span>
              <span v-else class="event-badge-none">
                Sin Evento
              </span>
            </div>
          </div>

          <!-- Body: Miembros -->
          <div class="team-card-body">
            <div class="members-sub-header">
              <span class="sub-header-label">Miembros</span>
              <span class="sub-header-count">{{ equipo.participantes?.length || 0 }}</span>
            </div>
            
            <div class="members-avatars">
              <template v-if="equipo.participantes && equipo.participantes.length > 0">
                <div v-for="(m, i) in equipo.participantes.slice(0,4)" :key="m.id" 
                     class="member-avatar" :title="m.user.name">
                  {{ m.user.name.charAt(0).toUpperCase() }}
                </div>
                <div v-if="equipo.participantes.length > 4" class="member-avatar more">
                  +{{ equipo.participantes.length - 4 }}
                </div>
              </template>
              <div v-else class="no-members-text">
                Sin miembros
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="team-card-footer">
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
import api from '../../plugins/axios'
import alerts from '../../services/alerts'

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
  if (!await alerts.confirmDelete('¿Eliminar equipo? Esta acción no se puede deshacer.')) return
  try {
    await api.delete(`/admin/equipos/${id}`)
    successMsg.value = 'Equipo eliminado exitosamente'
    fetchData(pagination.value.page)
    setTimeout(() => successMsg.value = '', 3000)
  } catch (e) {
    alerts.error(e.response?.data?.message || 'Error al eliminar')
  }
}
</script>

<style scoped>
.view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-main { display: flex; align-items: center; gap: 1.5rem; }
.view-title { font-size: 1.875rem; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -0.025em; }

.breadcrumb { font-size: 0.875rem; color: var(--text-muted); display: flex; gap: 0.5rem; align-items: center; }
.breadcrumb-item { color: inherit; text-decoration: none; transition: color 0.2s; }
.breadcrumb-item:hover { color: var(--indigo-600); }
.breadcrumb-sep { opacity: 0.5; }
.breadcrumb-active { color: var(--indigo-600); font-weight: 700; }
.dark .breadcrumb-active { color: var(--indigo-400); }

.filters-panel { background: var(--bg-card); padding: 1.25rem; border-radius: 1rem; border: 1px solid var(--border-color); display: flex; flex-wrap: wrap; gap: 1.25rem; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.filters-label { display: flex; align-items: center; gap: 0.75rem; color: var(--text-muted); }
.label-text { font-size: 0.875rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }

.filters-actions { display: flex; flex-wrap: wrap; gap: 1rem; flex: 1; justify-content: flex-end; }
.search-wrapper { position: relative; width: 100%; max-width: 18rem; }
.search-input-styled { width: 100%; padding: 0.625rem 1rem 0.625rem 2.75rem !important; border-radius: 0.75rem !important; }
.search-icon-abs { width: 1.125rem; height: 1.125rem; position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
.event-select-styled { width: 100%; max-width: 14rem; padding: 0.625rem 1rem !important; border-radius: 0.75rem !important; }

.teams-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5rem; }
@media (max-width: 1024px) { .teams-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .teams-grid { grid-template-columns: 1fr; } }

.team-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 1rem; overflow: hidden; display: flex; flex-direction: column; transition: all 0.3s ease; }
.team-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--indigo-500); }

.team-card-header { padding: 1.5rem; border-bottom: 1px solid var(--border-color); }
.header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
.team-avatar { width: 3.5rem; height: 3.5rem; border-radius: 1rem; background: linear-gradient(135deg, var(--indigo-500), var(--purple-600)); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 1.5rem; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); }

.card-actions { display: flex; gap: 0.5rem; }
.action-btn { padding: 0.5rem; border-radius: 0.75rem; color: var(--text-muted); background: var(--bg-input); border: none; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.action-btn:hover { color: var(--indigo-600); background: var(--indigo-50); }
.action-btn.danger:hover { color: #dc2626 !important; background: #fef2f2 !important; }

.team-name { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: -0.025em; }
.event-badge-container { margin-top: 0.75rem; }
.event-badge { display: inline-flex; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; background: var(--indigo-50); color: var(--indigo-700); border: 1px solid var(--indigo-100); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dark .event-badge { background: var(--bg-input); color: var(--indigo-400); border-color: var(--border-color); }
.event-badge-none { display: inline-flex; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 700; background: var(--card-muted); color: var(--text-muted); border: 1px solid var(--border-color); }

.team-card-body { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; justify-content: flex-end; }
.members-sub-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.sub-header-label { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.sub-header-count { font-size: 0.875rem; font-weight: 800; color: var(--text-primary); }

.members-avatars { display: flex; padding-left: 0.5rem; }
.member-avatar { width: 2rem; height: 2rem; border-radius: 50%; background: #e5e7eb; color: #4b5563; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; border: 2px solid var(--bg-card); margin-left: -0.5rem; transition: all 0.2s; }
.member-avatar:hover { transform: translateY(-4px); z-index: 10; }
.member-avatar.more { background: #f3f4f6; color: #6b7280; font-size: 0.75rem; }
.no-members-text { font-size: 0.875rem; color: var(--text-muted); font-style: italic; }

.team-card-footer { padding: 1.25rem 1.5rem; background: var(--card-muted); border-top: 1px solid var(--border-color); }
.manage-btn { display: block; width: 100%; text-align: center; padding: 0.75rem; background: var(--bg-card); border: 1.5px solid var(--border-color); border-radius: 0.875rem; color: var(--text-secondary); font-size: 0.875rem; font-weight: 700; text-decoration: none; transition: all 0.2s; }
.manage-btn:hover { background: var(--indigo-600); color: #fff; border-color: var(--indigo-600); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem; background: var(--bg-card); border-radius: 1.5rem; border: 2px dashed var(--border-color); }
.empty-icon-container { background: var(--card-muted); padding: 1.5rem; border-radius: 2rem; margin-bottom: 1.5rem; color: var(--text-muted); }
.empty-title { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem; }
.empty-text { font-size: 0.875rem; color: var(--text-muted); text-align: center; max-width: 20rem; }

.icon-sm { width: 1.25rem; height: 1.25rem; }
.icon-md { width: 1.5rem; height: 1.5rem; }
.icon-lg { width: 3rem; height: 3rem; }
</style>
