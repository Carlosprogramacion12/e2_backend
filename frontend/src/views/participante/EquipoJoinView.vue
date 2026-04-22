<template>
  <AppLayout>
    <div class="page-container">
      <!-- HEADER SEARCH CARD -->
      <div class="header-search-card shadow-sm">
        <div class="search-info">
          <div class="search-title-row">
            <svg class="search-icon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <h2 class="search-title">Buscar Vacantes</h2>
          </div>
          <p class="search-subtitle">Encuentra un equipo que necesite tu perfil técnico.</p>
        </div>
        
        <div class="event-selector-box">
          <div class="select-wrapper">
            <select v-model="selectedEventoId" class="formal-select" @change="fetchEquipos">
              <option v-if="!eventos.length" value="">Buscando eventos...</option>
              <option v-for="ev in eventos" :key="ev.id" :value="ev.id">{{ ev.nombre }}</option>
            </select>
            <svg class="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <div v-if="loadingEventos" class="loading-center">
        <div class="spinner"></div>
      </div>

      <div v-else-if="!eventos.length" class="empty-state-card">
        <div class="empty-icon-box">
          <svg style="width:3rem;height:3rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        </div>
        <h3 class="empty-title">No hay eventos disponibles</h3>
        <p class="empty-desc">Actualmente no hay eventos próximos para registro. Vuelve más tarde.</p>
      </div>

      <div v-else>
        <div v-if="loadingEquipos" class="loading-center" style="height: 300px;">
          <div class="spinner"></div>
        </div>

        <div v-else-if="!equipos.length" class="empty-state-card">
          <div class="empty-icon-box">
            <svg style="width:3rem;height:3rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </div>
          <h3 class="empty-title">Sin equipos en este evento</h3>
          <p class="empty-desc">No encontramos equipos con vacantes en este evento.</p>
        </div>

        <div v-else class="teams-grid">
          <!-- CARD DE EQUIPO (Mismo diseño que la foto) -->
          <div v-for="e in equipos" :key="e.id" class="team-card shadow-card">
            <div class="card-gradient-top"></div>
            
            <div class="team-card-header">
              <div class="header-top-row">
                <h3 class="team-name">{{ e.nombre }}</h3>
                <div class="vacancy-badge">
                  <svg class="user-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a7 7 0 00-7 7v1h11v-1a7 7 0 00-7-7z"/></svg>
                  <span>{{ e.miembros }}/{{ e.max_miembros }}</span>
                </div>
              </div>
              <div class="event-tag-box">
                <span class="event-tag">{{ getEventoNombre() }}</span>
              </div>
            </div>

            <div class="team-card-body">
              <div class="project-info-row">
                <svg class="bulb-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.674a1 1 0 01.992.883l.117 1.053a1 1 0 01-.991 1.11H9.593a1 1 0 01-.992-1.11l.117-1.053a1 1 0 01.992-.884h-.047zM8 11V7a4 4 0 118 0v4M5 11h14M8 11a4 4 0 004 4m0-8V3"/></svg>
                <h4 class="project-title">{{ e.proyecto_nombre }}</h4>
              </div>
              <!-- Descripción truncada (igual que en los avances pero para el equipo) -->
              <p class="team-description">{{ e.descripcion || 'Sin descripción detallada del proyecto.' }}</p>
            </div>

            <div class="team-card-footer">
              <button 
                class="btn-solicitar-full" 
                :class="{ 'btn-enviado': e.solicitado }"
                @click="solicitar(e.id)"
                :disabled="e.solicitado || e.vacantes <= 0"
              >
                <div v-if="submittingId === e.id" class="spinner-white" style="width:1.25rem;height:1.25rem"></div>
                <template v-else>
                  <svg class="send-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                  <span>{{ e.solicitado ? 'SOLICITUD ENVIADA' : 'ENVIAR SOLICITUD' }}</span>
                </template>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'

const router = useRouter()
const route = useRoute()
const eventos = ref([])
const equipos = ref([])
const selectedEventoId = ref('')
const search = ref('')
const loadingEventos = ref(true)
const loadingEquipos = ref(false)
const submittingId = ref(null)

let searchTimeout = null

async function fetchEventos() {
  try {
    loadingEventos.value = true
    const r = await api.get('/participante/eventos-proximos')
    eventos.value = r.data.data || []
    
    if (eventos.value.length > 0) {
      if (route.query.evento_id) {
        selectedEventoId.value = Number(route.query.evento_id)
      } else {
        selectedEventoId.value = eventos.value[0].id
      }
      await fetchEquipos()
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingEventos.value = false
  }
}

async function fetchEquipos() {
  if (!selectedEventoId.value) return
  try {
    loadingEquipos.value = true
    const r = await api.get('/participante/equipos-disponibles', { 
      params: { 
        evento_id: selectedEventoId.value,
        search: search.value 
      } 
    })
    equipos.value = r.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loadingEquipos.value = false
  }
}

function getEventoNombre() {
  const ev = eventos.value.find(ex => ex.id === selectedEventoId.value)
  return ev ? ev.nombre.toUpperCase() : ''
}

function doSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchEquipos, 400)
}

function solicitar(id) {
  router.push({ name: 'SolicitarEquipo', params: { id } })
}

onMounted(fetchEventos)
</script>

<style scoped>
.page-container { max-width: 1400px; margin: 0 auto; padding: 2rem; background: #f8fafc; min-height: 100vh; }

/* HEADER CARD */
.header-search-card {
  background: white; border-radius: 1.25rem; padding: 1.5rem 2rem;
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 2rem; border: 1px solid #e2e8f0;
}
.search-icon-purple { width: 1.5rem; height: 1.5rem; color: #4f46e5; margin-right: 0.625rem; }
.search-title-row { display: flex; align-items: center; margin-bottom: 0.125rem; }
.search-title { font-size: 1.35rem; font-weight: 700; color: #1e293b; margin: 0; }
.search-subtitle { font-size: 0.875rem; color: #64748b; margin: 0; font-weight: 500; }

.event-selector-box { width: 280px; }
.select-wrapper { position: relative; }
.formal-select {
  width: 100%; height: 3rem; background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 0.75rem; padding: 0 1.25rem; padding-right: 2.75rem;
  font-size: 0.875rem; font-weight: 600; color: #334155; cursor: pointer;
  appearance: none; transition: all 0.2s;
}
.formal-select:focus { border-color: #4f46e5; background: white; outline: none; box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }
.chevron-icon { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); width: 1.125rem; height: 1.125rem; color: #94a3b8; pointer-events: none; }

/* GRID */
.teams-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }

/* TEAM CARD */
.team-card {
  background: white; border-radius: 1.25rem; border: 1px solid #e2e8f0;
  overflow: hidden; position: relative; display: flex; flex-direction: column;
  transition: all 0.2s;
}
.shadow-card { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
.team-card:hover { transform: translateY(-4px); box-shadow: 0 15px 20px -5px rgba(0, 0, 0, 0.08); }

.card-gradient-top { height: 5px; background: linear-gradient(90deg, #4f46e5 0%, #ec4899 100%); width: 100%; }

.team-card-header { padding: 1.25rem 1.25rem 0.75rem; }
.header-top-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem; }
.team-name { font-size: 1.35rem; font-weight: 700; color: #1e293b; margin: 0; line-height: 1.2; }

.vacancy-badge {
  background: #eff6ff; color: #1d4ed8; padding: 0.25rem 0.625rem;
  border-radius: 9999px; display: flex; align-items: center; gap: 0.375rem;
  font-size: 0.75rem; font-weight: 700;
}
.user-icon { width: 0.875rem; height: 0.875rem; }

.event-tag-box { margin-top: 0.25rem; }
.event-tag { background: #f1f5f9; color: #64748b; font-size: 0.65rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 4px; letter-spacing: 0.05em; }

.team-card-body { padding: 0 1.25rem 1.25rem; flex-grow: 1; }
.project-info-row { display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.25rem; color: #1e293b; }
.bulb-icon { width: 1.125rem; height: 1.125rem; color: #94a3b8; margin-top: 0.125rem; flex-shrink: 0; }
.project-title { font-size: 1rem; font-weight: 700; margin: 0; line-height: 1.4; }
.team-description { font-size: 0.8125rem; color: #64748b; line-height: 1.5; margin: 0.375rem 0 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

/* FOOTER */
.team-card-footer { padding: 1rem 1.25rem 1.25rem; background: #fcfdfe; border-top: 1px solid #f1f5f9; }
.btn-solicitar-full {
  width: 100%; height: 3rem; background: #4f46e5; color: white; border-radius: 0.75rem;
  border: none; font-weight: 800; font-size: 0.875rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 0.625rem;
  transition: all 0.2s; letter-spacing: 0.02em;
}
.btn-solicitar-full:hover:not(:disabled) { background: #4338ca; transform: scale(1.02); }
.btn-solicitar-full:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }
.btn-enviado { background: #3b82f6 !important; opacity: 1 !important; transform: none !important; }
.send-icon { width: 1.25rem; height: 1.25rem; }

.loading-center { display: flex; align-items: center; justify-content: center; padding: 5rem; }
.spinner { width: 3rem; height: 3rem; border: 4px solid #f1f5f9; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }
.spinner-white { border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1024px) {
  .teams-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .header-search-card { flex-direction: column; align-items: flex-start; gap: 1.5rem; padding: 1.25rem; }
  .event-selector-box { width: 100%; }
  .teams-grid { grid-template-columns: 1fr; }
}
</style>
