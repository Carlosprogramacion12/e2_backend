<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary)">Gestión de Proyectos</h2>
      <span style="padding:.25rem .75rem;background:#e0e7ff;color:#4338ca;border-radius:9999px;font-size:.75rem;font-weight:700">
        {{ pagination.total || 0 }} Registros
      </span>
    </div>

    <!-- Success Message -->
    <div v-if="successMsg" class="alert alert-success" style="margin-bottom:1.5rem">
      <svg style="width:1.25rem;height:1.25rem;color:#34d399" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      {{ successMsg }}
    </div>

    <div style="background:var(--bg-main,#f9fafb);min-height:100vh">
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        
        <!-- BARRA DE HERRAMIENTAS (Filtros) -->
        <div style="background:var(--card-bg,#fff);padding:1rem;border-radius:1rem;box-shadow:0 1px 2px rgba(0,0,0,.05);border:1px solid var(--border,#e5e7eb);display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;align-items:center">
          
          <div style="display:flex;align-items:center;gap:.5rem;color:var(--text-muted)">
            <div style="padding:.5rem;background:#eef2ff;color:#4f46e5;border-radius:.5rem">
              <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
            </div>
            <span style="font-size:.875rem;font-weight:700">Filtrar:</span>
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:.75rem;flex:1;justify-content:flex-end">
            <!-- Buscar -->
            <div style="position:relative;width:100%;max-width:16rem">
              <input type="text" v-model="search" @input="debouncedSearch" placeholder="Buscar proyecto..."
                    style="width:100%;padding:.5rem 1rem .5rem 2.5rem;border-radius:.75rem;border:1px solid var(--border,#e5e7eb);background:var(--input-bg,#f9fafb);font-size:.875rem">
              <svg style="width:1rem;height:1rem;position:absolute;left:.75rem;top:50%;transform:translateY(-50%);color:#9ca3af" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            
            <!-- Evento Selector -->
            <select v-model="eventoId" @change="fetchData(1)" style="width:100%;max-width:12rem;padding:.5rem 1rem;border-radius:.75rem;border:1px solid var(--border,#e5e7eb);background:var(--input-bg,#f9fafb);font-size:.875rem;cursor:pointer">
              <option value="">Todos los eventos</option>
              <option v-for="ev in eventos" :key="ev.id" :value="ev.id">
                {{ ev.nombre.substring(0,25) }}{{ ev.nombre.length > 25 ? '...' : '' }}
              </option>
            </select>

            <button v-if="search || eventoId" @click="clearFilters" class="btn btn-white" style="padding:.5rem;border-radius:.75rem;display:flex;align-items:center;justify-content:center" title="Limpiar filtros">
              <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        <!-- TABLA DE PROYECTOS -->
        <div style="background:var(--card-bg,#fff);border-radius:1rem;box-shadow:0 1px 2px rgba(0,0,0,.05);border:1px solid var(--border,#e5e7eb);overflow:hidden">
          
          <div v-if="loading" style="padding:4rem;text-align:center"><div class="spinner"></div></div>

          <div v-else style="overflow-x:auto">
            <table v-if="proyectos.length > 0" style="width:100%;text-align:left;border-collapse:collapse">
              <thead>
                <tr style="background:rgba(243, 244, 246, 0.5);border-bottom:1px solid var(--border,#f3f4f6);color:#6b7280;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em">
                  <th style="padding:1rem 1.5rem;font-weight:600">Proyecto</th>
                  <th style="padding:1rem 1.5rem;font-weight:600">Equipo Responsable</th>
                  <th style="padding:1rem 1.5rem;font-weight:600">Evento</th>
                  <th style="padding:1rem 1.5rem;font-weight:600;text-align:right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="proyecto in proyectos" :key="proyecto.id" class="hover:bg-gray-50 group" style="border-bottom:1px solid var(--border,#f3f4f6);transition:background 0.2s">
                  <!-- COLUMNA PROYECTO -->
                  <td style="padding:1rem 1.5rem;vertical-align:top">
                    <div style="display:flex;align-items:flex-start;gap:.75rem">
                      <div style="padding:.5rem;background:#eff6ff;color:#3b82f6;border-radius:.5rem;margin-top:.25rem">
                        <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                      </div>
                      <div>
                        <p style="font-weight:700;font-size:.875rem;color:var(--text-primary);margin:0 0 .25rem">{{ proyecto.nombre }}</p>
                        <a v-if="proyecto.repositorio_url" :href="proyecto.repositorio_url" target="_blank" style="display:inline-flex;align-items:center;gap:.25rem;font-size:.75rem;color:#3b82f6;text-decoration:none" class="hover:underline">
                          <svg style="width:.75rem;height:.75rem" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          Repositorio
                        </a>
                        <span v-else style="font-size:.75rem;color:#9ca3af;font-style:italic">Sin repositorio</span>
                      </div>
                    </div>
                  </td>

                  <!-- COLUMNA EQUIPO -->
                  <td style="padding:1rem 1.5rem;vertical-align:top">
                    <div v-if="proyecto.equipo" style="display:flex;align-items:center;gap:.5rem">
                      <div style="width:2rem;height:2rem;border-radius:9999px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:#4b5563;border:1px solid #e5e7eb">
                        {{ proyecto.equipo.nombre.charAt(0).toUpperCase() }}
                      </div>
                      <span style="font-size:.875rem;font-weight:500;color:#374151">{{ proyecto.equipo.nombre }}</span>
                    </div>
                    <span v-else style="display:inline-flex;padding:.25rem .5rem;border-radius:.25rem;background:#fee2e2;color:#991b1b;font-size:.75rem;font-weight:700">
                      Sin Asignar
                    </span>
                  </td>

                  <!-- COLUMNA EVENTO -->
                  <td style="padding:1rem 1.5rem;vertical-align:top">
                    <span v-if="proyecto.evento" style="display:inline-flex;padding:.125rem .625rem;border-radius:9999px;font-size:.75rem;font-weight:500;background:#f3e8ff;color:#6b21a8;border:1px solid #e9d5ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px" :title="proyecto.evento.nombre">
                      {{ proyecto.evento.nombre }}
                    </span>
                    <span v-else style="font-size:.75rem;color:#9ca3af">N/A</span>
                  </td>

                  <!-- COLUMNA ACCIONES -->
                  <td style="padding:1rem 1.5rem;vertical-align:top;text-align:right">
                    <div style="display:flex;justify-content:flex-end;align-items:center;gap:.5rem">
                      <router-link :to="`/admin/proyectos/${proyecto.id}`" class="btn btn-white hover:text-indigo-600" style="padding:.375rem .75rem;border-radius:.5rem;font-size:.75rem;font-weight:700;text-transform:uppercase;display:inline-flex;align-items:center;box-shadow:0 1px 2px rgba(0,0,0,0.05);text-decoration:none">
                        <svg style="width:1rem;height:1rem;margin-right:.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        Ver
                      </router-link>
                      <button @click="deleteProyecto(proyecto.id)" class="btn btn-white hover:bg-red-50 hover:text-red-600 group" style="padding:.375rem .75rem;border-radius:.5rem;font-size:.75rem;font-weight:700;color:#dc2626;text-transform:uppercase;display:inline-flex;align-items:center;box-shadow:0 1px 2px rgba(0,0,0,0.05);border-color:#fca5a5">
                        <svg style="width:1rem;height:1rem;margin-right:.25rem" class="group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div v-else style="padding:3rem;text-align:center;color:#6b7280">
              <svg style="width:3rem;height:3rem;color:#d1d5db;margin:0 auto 1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p style="font-weight:500;font-size:1rem;color:var(--text-primary);margin:0">No se encontraron proyectos.</p>
              <p style="font-size:.875rem;margin:.25rem 0 0">Intenta ajustar los filtros de búsqueda.</p>
            </div>
          </div>

          <!-- PAGINACIÓN -->
          <Pagination 
            v-model="pagination.page" 
            :total-pages="pagination.totalPages" 
            @update:model-value="fetchData" 
            style="padding: 1rem 1.5rem"
          />
        </div>

      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import Pagination from '../../components/common/Pagination.vue'
import api from '../../services/api'

const router = useRouter()
const proyectos = ref([])
const eventos = ref([])
const loading = ref(true)
const search = ref('')
const eventoId = ref('')
const successMsg = ref('')

let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchData(1), 300)
}

const pagination = ref({ page: 1, limit: 10, totalPages: 1, total: 0 })

onMounted(() => {
  fetchData()
})

async function fetchData(page = 1) {
  loading.value = true
  try {
    const params = { page, limit: 10 }
    if (search.value) params.search = search.value
    if (eventoId.value) params.evento_id = eventoId.value

    const r = await api.get('/admin/proyectos', { params })
    proyectos.value = r.data.data.proyectos || r.data.data
    if (r.data.data.pagination) {
      pagination.value = r.data.data.pagination
    }
    
    // Load events for filter only once
    if (eventos.value.length === 0) {
      try {
        const eRes = await api.get('/admin/eventos', { params: { limit: 100 } })
        eventos.value = eRes.data.data.eventos || []
      } catch(e) {}
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

async function deleteProyecto(id) {
  if (!confirm('¿Estás seguro de eliminar este proyecto permanentemente? Se perderán las evaluaciones asociadas.')) return
  try {
    await api.delete(`/admin/proyectos/${id}`)
    successMsg.value = 'Proyecto eliminado exitosamente'
    fetchData(pagination.value.page)
    setTimeout(() => successMsg.value = '', 3000)
  } catch (e) {
    alert(e.response?.data?.message || 'Error al eliminar')
  }
}
</script>

<style scoped>
.btn:hover.group .group-hover\:animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8,0,1,1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0,0,0.2,1);
  }
}
</style>
