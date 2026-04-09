<template>
  <AppLayout>
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem">
      <div>
        <h2 style="font-size:1.5rem;font-weight:700">Gestión de Usuarios</h2>
        <div style="display:flex;gap:.75rem;margin-top:.75rem">
          <button class="btn btn-green" @click="exportToExcel">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Exportar a Excel
          </button>
          <router-link :to="{ name: 'UsuariosCreate' }" class="btn btn-indigo" style="text-decoration:none">
            <span>+</span> Nuevo Usuario
          </router-link>
        </div>
      </div>
      <nav style="font-size:.875rem;color:var(--text-muted);display:flex;gap:.5rem;align-items:center;margin-top:.25rem">
        <router-link to="/admin/dashboard" style="color:inherit;text-decoration:none" class="hover:text-indigo-600">Dashboard</router-link>
        <span>/</span>
        <span style="color:#4f46e5;font-weight:600">Usuarios</span>
      </nav>
    </div>

    <!-- Success Alert (from route query) -->
    <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>

    <!-- Table Container -->
    <div class="table-container">
      <!-- Filters -->
      <div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
        <div style="display:flex;gap:1rem;flex:1">
          <div style="position:relative;width:20rem">
            <div style="position:absolute;inset:0;right:auto;padding-left:.75rem;display:flex;align-items:center;pointer-events:none;color:#9ca3af">
              <svg style="width:1.25rem;height:1.25rem" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <input v-model="search" class="form-control" style="padding-left:2.5rem" placeholder="Buscar por nombre o correo..." @input="debounceFetch">
          </div>
          <select v-model="roleFilter" class="form-control" style="width:14rem" @change="fetchUsuarios">
            <option value="">Todos los roles</option>
            <option value="Admin">Admin</option>
            <option value="Juez">Juez</option>
            <option value="Participante">Participante</option>
          </select>
        </div>
        <div style="font-size:.875rem;font-weight:500;color:#6b7280">
          Total: <span style="color:#4f46e5;font-weight:700">{{ pagination.total || 0 }}</span> usuarios
        </div>
      </div>

      <!-- Table -->
      <div v-if="loading" class="loading" style="padding:4rem"><div class="spinner"></div></div>
      <table v-else>
        <thead>
          <tr>
            <th style="min-width:220px;padding-left:2rem">Usuario</th>
            <th>Rol</th>
            <th>Fecha Registro</th>
            <th style="text-align:right;padding-right:2rem">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usuarios" :key="u.id">
            <td style="padding-left:2rem">
              <div style="display:flex;align-items:center;gap:1rem">
                <div class="user-avatar-sm">
                  <img v-if="!failedAvatars[u.id]"
                       :src="`/uploads/avatars/${u.id}.jpg?v=${avatarVersion}`" 
                       alt="" class="user-avatar-img" 
                       @error="onAvatarError(u.id)" />
                  <span v-else class="user-avatar-initials">{{ (u.name || u.email || '?')[0].toUpperCase() }}</span>
                </div>
                <div>
                  <h5 style="font-weight:600;color:var(--text-primary);margin:0">{{ u.name }}</h5>
                  <p style="font-size:.875rem;color:var(--text-muted);margin:0">{{ u.email }}</p>
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
            <td style="text-align:right;padding-right:2rem">
              <div style="display:flex;align-items:center;justify-content:flex-end;gap:.75rem">
                <router-link :to="{ name: 'UsuariosEdit', params: { id: u.id } }" class="action-icon" title="Editar">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </router-link>
                <button class="action-icon danger" @click="confirmDelete(u)" title="Eliminar">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="usuarios.length === 0">
            <td colspan="4" style="text-align:center;padding:4rem;color:var(--text-muted)">
              No se encontraron usuarios.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <Pagination 
        v-model="page" 
        :total-pages="pagination.totalPages" 
        @update:model-value="fetchUsuarios" 
      />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import Pagination from '../../components/common/Pagination.vue'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()
const usuarios = ref([])
const loading = ref(false)
const search = ref('')
const roleFilter = ref('')
const page = ref(1)
const successMsg = ref('')
const failedAvatars = reactive({})
const avatarVersion = ref(Date.now())

function onAvatarError(userId) {
  failedAvatars[userId] = true
}

const pagination = ref({
  total: 0,
  totalPages: 1
})

onMounted(() => {
  fetchUsuarios()
  if (route.query.success) {
    successMsg.value = route.query.success
    setTimeout(() => {
      successMsg.value = ''
      router.replace({ query: { ...route.query, success: undefined } })
    }, 4000)
  }
})


async function fetchUsuarios() {
  loading.value = true
  try {
    const params = {
      page: page.value,
      search: search.value,
      role: roleFilter.value
    }
    const res = await api.get('/admin/usuarios', { params })
    const responseData = res.data.data || {}
    usuarios.value = responseData.usuarios || []
    pagination.value = responseData.pagination || { total: usuarios.value.length, totalPages: 1 }
  } catch (err) {
    console.error('Error fetching users:', err)
  } finally {
    loading.value = false
  }
}

let timeout = null
function debounceFetch() {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    page.value = 1
    fetchUsuarios()
  }, 500)
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

async function confirmDelete(u) {
  if (confirm(`¿Estás seguro de eliminar a ${u.name}? Esta acción es irreversible.`)) {
    try {
      await api.delete(`/admin/usuarios/${u.id}`)
      successMsg.value = 'Usuario eliminado correctamente'
      fetchUsuarios()
      setTimeout(() => successMsg.value = '', 3000)
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar usuario')
    }
  }
}

async function exportToExcel() {
  try {
    const params = new URLSearchParams()
    if (search.value) params.append('search', search.value)
    if (roleFilter.value) params.append('role', roleFilter.value)
    
    const res = await api.get(`/admin/usuarios/exportar?${params.toString()}`, { 
      responseType: 'blob' 
    })

    // Extract filename from Content-Disposition header or use fallback
    const disposition = res.headers['content-disposition'] || ''
    const filenameMatch = disposition.match(/filename=(.+?)(?:;|$)/)
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const fallbackName = `usuarios_${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.xlsx`
    const filename = filenameMatch ? filenameMatch[1] : fallbackName
    
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error exporting to Excel:', err)
    alert('Error al exportar los datos')
  }
}

</script>
