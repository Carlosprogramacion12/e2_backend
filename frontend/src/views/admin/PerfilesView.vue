<template>
  <AppLayout>
    <div class="card">
      <div class="card-header">
        <span>Gestión de Perfiles Directivos</span>
        <button @click="openModal()" class="btn btn-indigo btn-sm">
          <PlusIcon class="w-4 h-4 mr-1" /> Nuevo Perfil
        </button>
      </div>
      <div class="card-body">
        <div v-if="loading" class="loading"><div class="spinner"></div></div>
        <div v-else-if="perfiles.length === 0" class="empty-state">
          <p>No se encontraron perfiles registrados.</p>
        </div>
        <div v-else class="table-container" style="padding:0;border:none;box-shadow:none">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Perfil</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="perfil in perfiles" :key="perfil.id">
                <td>#{{ perfil.id }}</td>
                <td class="font-medium">{{ perfil.nombre }}</td>
                <td>
                  <div class="flex gap-2">
                    <button @click="openModal(perfil)" class="action-icon" title="Editar">
                      <EditIcon class="w-5 h-5" />
                    </button>
                    <button @click="confirmDelete(perfil)" class="action-icon danger" title="Eliminar">
                      <TrashIcon class="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
            <div style="padding:1rem 1.5rem;background:#f9fafb;display:flex;justify-content:flex-end;gap:1rem">
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
import { ref, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'
import { PlusIcon, EditIcon, TrashIcon } from 'lucide-vue-next'

const perfiles = ref([])
const loading = ref(true)
const showModal = ref(false)
const saving = ref(false)
const editingId = ref(null)
const form = ref({ nombre: '' })

async function fetchPerfiles() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/perfiles')
    perfiles.value = data.data
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
  } catch (error) { alert(error.response?.data?.message || 'Error al guardar') }
  finally { saving.value = false }
}

async function confirmDelete(perfil) {
  if (confirm(`¿Estás seguro de eliminar el perfil "${perfil.nombre}"?`)) {
    try {
      await api.delete(`/admin/perfiles/${perfil.id}`)
      fetchPerfiles()
    } catch (error) { alert('Error al eliminar') }
  }
}

onMounted(fetchPerfiles)
</script>
