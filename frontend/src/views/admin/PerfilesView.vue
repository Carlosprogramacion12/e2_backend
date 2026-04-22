<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem">
      <div>
        <h2 style="font-size:1.5rem;font-weight:700">Gestión de Perfiles</h2>
      </div>
      <nav style="font-size:.875rem;color:var(--text-muted);display:flex;gap:.5rem;align-items:center;margin-top:.25rem">
        <router-link to="/admin/dashboard" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Dashboard</router-link>
        <span>/</span>
        <span style="color:#4f46e5;font-weight:600">Perfiles</span>
      </nav>
    </div>

    <div class="card">
      <div class="card-header" style="flex-wrap: wrap; gap: 1rem;">
        <div style="position:relative;width:100%;max-width:300px">
          <div style="position:absolute;top:50%;left:10px;transform:translateY(-50%);pointer-events:none">
            <SearchIcon class="w-5 h-5" style="color:#9ca3af" />
          </div>
          <input v-model="searchQuery" type="text" class="form-control" placeholder="Buscar perfil..." style="padding-left:2.5rem;width:100%;">
        </div>

        <button @click="openModal()" class="btn btn-indigo">
          <PlusIcon class="w-4 h-4" /> Nuevo Perfil
        </button>
      </div>
      <div class="card-body">
        <div v-if="loading" class="loading"><div class="spinner"></div></div>
        <div v-else-if="perfiles.length === 0" class="empty-state">
          <p>No se encontraron perfiles registrados.</p>
        </div>
        <div v-else class="table-container" style="padding:0;border:none;box-shadow:none">
          <table>
            <thead style="background:#f9fafb">
              <tr>
                <th style="padding-left:2rem">Nombre del Perfil</th>
                <th>Fecha Creación</th>
                <th style="text-align:right;padding-right:2rem">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="perfil in perfiles" :key="perfil.id">
                <td style="padding-left:2rem">
                  <div style="display:flex;align-items:center;gap:.75rem">
                    <div class="user-avatar-sm">
                      <span class="user-avatar-initials">{{ perfil.nombre ? perfil.nombre.substring(0, 1).toUpperCase() : '' }}</span>
                    </div>
                    <span style="font-weight:600">{{ perfil.nombre }}</span>
                  </div>
                </td>
                <td style="color:#6b7280">
                  {{ formatDate(perfil.created_at) }}
                </td>
                <td style="text-align:right;padding-right:2rem">
                  <div style="display:flex;align-items:center;justify-content:flex-end;gap:.75rem">
                    <button @click="openModal(perfil)" class="action-icon" title="Editar">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button @click="confirmDelete(perfil)" class="action-icon danger" title="Eliminar">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <Pagination 
            v-model="page" 
            :total-pages="pagination.totalPages" 
            @update:model-value="fetchPerfiles" 
            style="padding: 1rem 1.5rem"
          />
        </div>
      </div>

      <!-- Modal Form -->
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <span>{{ editingId ? 'Editar Perfil' : 'Nuevo Perfil' }}</span>
            <button @click="showModal = false" class="modal-close">&times;</button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="form-group">
                <label>Nombre del Perfil</label>
                <input v-model="form.nombre" type="text" class="form-control" placeholder="Ej: Programador, Diseñador..." required>
              </div>
            </div>
            <div style="padding:1rem 1.5rem;background:#f9fafb;display:flex;justify-content:flex-end;gap:1rem;border-top:1px solid #e5e7eb">
              <button type="button" @click="showModal = false" class="btn btn-outline btn-sm">Cancelar</button>
              <button type="submit" class="btn btn-indigo btn-sm" :disabled="saving">
                {{ saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import Pagination from '../../components/common/Pagination.vue'
import api from '../../plugins/axios'
import { PlusIcon, SearchIcon } from 'lucide-vue-next'

const perfiles = ref([])
const loading = ref(true)
const showModal = ref(false)
const saving = ref(false)
const editingId = ref(null)
const form = ref({ nombre: '' })
const searchQuery = ref('')
const page = ref(1)
const pagination = ref({ total: 0, totalPages: 1 })

watch(searchQuery, () => {
  page.value = 1
  fetchPerfiles()
})

function formatDate(dateStr) {
  if (!dateStr) return 'Recién creado'
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function fetchPerfiles() {
  loading.value = true
  try {
    const params = {
      page: page.value,
      search: searchQuery.value,
      limit: 10
    }
    const { data } = await api.get('/admin/perfiles', { params })
    perfiles.value = data.data || []
    pagination.value = data.pagination || { total: perfiles.value.length, totalPages: 1 }
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

function openModal(perfil = null) {
  if (perfil) {
    editingId.value = perfil.id
    form.value = { nombre: perfil.nombre }
  } else {
    editingId.value = null
    form.value = { nombre: '' }
  }
  showModal.value = true
}

import alerts from '../../services/alerts'

async function handleSubmit() {
  saving.value = true
  try {
    if (editingId.value) {
      await api.put(`/admin/perfiles/${editingId.value}`, form.value)
    } else {
      await api.post('/admin/perfiles', form.value)
    }
    showModal.value = false
    fetchPerfiles()
  } catch (error) { alerts.error(error.response?.data?.message || 'Error al guardar') }
  finally { saving.value = false }
}

async function confirmDelete(perfil) {
  if (await alerts.confirmDelete('¿Eliminar este perfil? Esto podría afectar a equipos existentes.')) {
    try {
      await api.delete(`/admin/perfiles/${perfil.id}`)
      fetchPerfiles()
    } catch (error) { alerts.error('Error al eliminar') }
  }
}

onMounted(fetchPerfiles)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalIn 0.2s ease-out;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 1.125rem;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
}

.modal-close:hover {
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
