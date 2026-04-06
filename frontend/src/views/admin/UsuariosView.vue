<template>
  <AppLayout>
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 style="font-size:1.5rem;font-weight:700">Gestión de Usuarios</h2>
      <div style="display:flex;gap:.75rem">
        <button class="btn btn-green" @click="exportToExcel">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Exportar a Excel
        </button>
        <button class="btn btn-indigo" @click="openModal()">
          <span>+</span> Nuevo Usuario
        </button>
      </div>
    </div>

    <!-- Success Alert -->
    <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>

    <!-- Table Container -->
    <div class="table-container">
      <!-- Filters -->
      <div style="display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
        <div style="display:flex;gap:.75rem;flex:1">
          <div style="position:relative;width:16rem">
            <div style="position:absolute;inset:0;right:auto;padding-left:.75rem;display:flex;align-items:center;pointer-events:none;color:#9ca3af">
              <svg style="width:1.25rem;height:1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <input v-model="search" class="form-control" style="padding-left:2.5rem" placeholder="Buscar usuario..." @input="debounceFetch">
          </div>
          <select v-model="roleFilter" class="form-control" style="width:12rem" @change="fetchUsuarios">
            <option value="">Todos los roles</option>
            <option v-for="r in roles" :key="r.id" :value="r.nombre">{{ r.nombre }}</option>
          </select>
        </div>
        <div style="font-size:.875rem;font-weight:500;color:#6b7280">
          Total: <span style="color:#4f46e5">{{ pagination.total || 0 }}</span>
        </div>
      </div>

      <!-- Table -->
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <table v-else>
        <thead>
          <tr><th style="min-width:220px;padding-left:2.5rem">Usuario</th><th>Rol</th><th>Fecha Registro</th><th style="text-align:right">Acciones</th></tr>
        </thead>
        <tbody>
          <tr v-for="u in usuarios" :key="u.id">
            <td style="padding-left:2.5rem">
              <div style="display:flex;align-items:center;gap:1rem">
                <div class="user-avatar-sm">{{ (u.name || u.email || '?')[0].toUpperCase() }}</div>
                <div>
                  <h5 style="font-weight:500">{{ u.name }}</h5>
                  <p style="font-size:.875rem;color:#6b7280">{{ u.email }}</p>
                </div>
              </div>
            </td>
            <td>
              <span v-for="r in u.roles" :key="r.id"
                :class="['badge', r.nombre==='Admin'?'badge-admin':r.nombre==='Juez'?'badge-juez':'badge-participante']">
                {{ r.nombre }}
              </span>
            </td>
            <td>{{ formatDate(u.created_at) }}</td>
            <td style="text-align:right">
              <div style="display:flex;align-items:center;justify-content:flex-end;gap:.75rem">
                <button class="action-icon" @click="openModal(u)">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button class="action-icon danger" @click="confirmDelete(u)">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination" v-if="pagination.totalPages > 1">
        <button :disabled="page<=1" @click="page--;fetchUsuarios()">←</button>
        <template v-for="p in paginationRange" :key="p">
          <button v-if="p !== '...'" :class="{active: p===page}" @click="page=p;fetchUsuarios()">{{ p }}</button>
          <span v-else style="padding:0 .25rem;color:#9ca3af">...</span>
        </template>
        <button :disabled="page>=pagination.totalPages" @click="page++;fetchUsuarios()">→</button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          {{ editingUser ? 'Editar' : 'Nuevo' }} Usuario
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="modalError" class="alert alert-danger">{{ modalError }}</div>
          <form @submit.prevent="saveUser">
            <div class="form-group"><label>Nombre</label><input v-model="form.nombre" class="form-control" required></div>
            <div class="form-group"><label>Email</label><input v-model="form.email" type="email" class="form-control" required></div>
            <div class="form-group"><label>Contraseña {{ editingUser ? '(dejar vacío para no cambiar)' : '' }}</label><input v-model="form.password" type="password" class="form-control" :required="!editingUser"></div>
            <div class="form-group"><label>Rol</label><select v-model="form.rol_id" class="form-control" required><option value="">Seleccionar rol</option><option v-for="r in roles" :key="r.id" :value="r.id">{{ r.nombre }}</option></select></div>
            <button type="submit" class="btn btn-indigo btn-block">{{ editingUser ? 'Actualizar' : 'Crear' }}</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content" style="text-align:center">
        <div style="padding:2rem">
          <div style="margin:0 auto 1rem;width:4rem;height:4rem;border-radius:50%;background:rgba(239,68,68,.1);display:flex;align-items:center;justify-content:center;color:#dc2626">
            <svg style="width:2rem;height:2rem" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:.5rem">¿Estás seguro?</h3>
          <p style="color:#6b7280;margin-bottom:1.5rem">Esta acción es irreversible y podría afectar los equipos asociados.</p>
          <div style="display:flex;justify-content:center;gap:1rem">
            <button class="btn btn-outline" @click="showDeleteModal=false">Cancelar</button>
            <button class="btn btn-red" @click="deleteUser">Sí, eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'

const usuarios = ref([]); const roles = ref([]); const loading = ref(true)
const search = ref(''); const roleFilter = ref(''); const page = ref(1)
const pagination = ref({}); const successMsg = ref('')
const showModal = ref(false); const showDeleteModal = ref(false)
const editingUser = ref(null); const deletingUser = ref(null)
const modalError = ref('')
const form = ref({ nombre:'', email:'', password:'', rol_id:'' })

let debounceTimer = null
function debounceFetch() { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => { page.value = 1; fetchUsuarios() }, 300) }

const paginationRange = computed(() => {
  const tp = pagination.value.totalPages || 1; const c = page.value; const r = []
  if (tp <= 7) { for (let i=1;i<=tp;i++) r.push(i) }
  else { r.push(1); if(c>3) r.push('...'); for(let i=Math.max(2,c-1);i<=Math.min(tp-1,c+1);i++) r.push(i); if(c<tp-2) r.push('...'); r.push(tp) }
  return r
})

function formatDate(d) { return d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '-' }

async function fetchUsuarios() {
  loading.value = true
  try {
    const { data: res } = await api.get('/admin/usuarios', { params: { search: search.value, role: roleFilter.value, page: page.value } })
    usuarios.value = res.data.usuarios; roles.value = res.data.roles; pagination.value = res.data.pagination
  } catch (e) {} finally { loading.value = false }
}

function openModal(u = null) {
  editingUser.value = u; modalError.value = ''
  form.value = u ? { nombre: u.name, email: u.email, password: '', rol_id: u.roles[0]?.id || '' } : { nombre: '', email: '', password: '', rol_id: '' }
  showModal.value = true
}
function closeModal() { showModal.value = false; editingUser.value = null }

async function saveUser() {
  modalError.value = ''
  try {
    if (editingUser.value) await api.put(`/admin/usuarios/${editingUser.value.id}`, form.value)
    else await api.post('/admin/usuarios', form.value)
    closeModal(); successMsg.value = editingUser.value ? 'Usuario actualizado.' : 'Usuario creado.'; fetchUsuarios()
    setTimeout(() => successMsg.value = '', 3000)
  } catch (e) { modalError.value = e.response?.data?.message || 'Error' }
}

function confirmDelete(u) { deletingUser.value = u; showDeleteModal.value = true }
async function deleteUser() {
  try { await api.delete(`/admin/usuarios/${deletingUser.value.id}`); showDeleteModal.value = false; successMsg.value = 'Usuario eliminado.'; fetchUsuarios(); setTimeout(() => successMsg.value = '', 3000) }
  catch (e) { alert(e.response?.data?.message || 'Error') }
}

async function exportToExcel() {
  try {
    const params = new URLSearchParams()
    if (search.value) params.append('search', search.value)
    if (roleFilter.value) params.append('role', roleFilter.value)
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/usuarios/exportar?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Usuarios_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    alert('Error al exportar')
  }
}

onMounted(fetchUsuarios)
</script>
