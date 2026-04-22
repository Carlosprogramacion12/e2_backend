<template>
  <AppLayout>
    <div class="header-section">
      <div>
        <h2 class="title">{{ teamName }}</h2>
        <p class="subtitle">Solicitudes de Unión Pendientes</p>
      </div>
      <router-link to="/participante/dashboard" class="btn btn-white">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Volver
      </router-link>
    </div>

    <div class="content-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <template v-else>
        <!-- Succes/Error Messages -->
        <div v-if="message" :class="['alert-box', messageType]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="messageType === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ message }}
        </div>

        <div v-if="solicitudes.length === 0" class="empty-state">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m7-4a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="empty-title">No hay solicitudes pendientes</h3>
          <p class="empty-desc">Todos los candidatos han sido procesados o no hay nuevas solicitudes.</p>
        </div>

        <div v-else class="solicitudes-list">
          <div v-for="solicitud in solicitudes" :key="solicitud.id" class="solicitud-card">
            <div class="card-body">
              <div class="info-header">
                <div class="user-main">
                  <h3 class="user-name">{{ solicitud.participante.user.name }}</h3>
                  <div class="user-meta">
                    <p><span class="label">Correo electrónico:</span> {{ solicitud.participante.user.email }}</p>
                    <p><span class="label">N.° de control:</span> {{ solicitud.participante.no_control || 'N/A' }}</p>
                    <p><span class="label">Carrera:</span> {{ solicitud.participante.carrera?.nombre || 'N/A' }}</p>
                  </div>
                </div>
                <div class="date-badge">{{ formatDate(solicitud.created_at) }}</div>
              </div>

              <!-- Mensaje -->
              <div v-if="solicitud.mensaje" class="message-box">
                <p class="message-text">
                  <span class="label">Mensaje:</span><br>
                  {{ solicitud.mensaje }}
                </p>
              </div>

              <!-- Rol Solicitado (Estilo Purpura Laravel) -->
              <div v-if="solicitud.perfilSugerido" class="role-request-box">
                <p class="role-text">
                  <span class="role-label font-bold">Rol Solicitado:</span> {{ solicitud.perfilSugerido.nombre }}
                </p>
              </div>

              <!-- Acciones -->
              <div class="actions-section">
                <div class="role-selector-field">
                  <label class="field-label">Rol a Asignar (opcional - si no especificas, se usará el solicitado)</label>
                  <select v-model="solicitud.selectedRole" class="form-select">
                    <option value="">-- Usar rol solicitado --</option>
                    <option v-for="perfil in perfiles" :key="perfil.id" :value="perfil.id">
                      {{ perfil.nombre }}
                    </option>
                  </select>
                </div>

                <div class="button-group">
                  <button @click="responder(solicitud, 'ACEPTADA')" class="btn btn-indigo" :disabled="processing">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    Aceptar
                  </button>
                  <button @click="responder(solicitud, 'RECHAZADA')" class="btn btn-gray" :disabled="processing">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'
import alerts from '../../services/alerts'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const processing = ref(false)
const solicitudes = ref([])
const perfiles = ref([])
const teamName = ref('')
const message = ref('')
const messageType = ref('')

async function fetchData() {
  try {
    loading.value = true
    const [solicitudesRes, perfilesRes] = await Promise.all([
      api.get(`/participante/equipos/${route.params.id}/solicitudes`),
      api.get('/participante/perfiles')
    ])
    
    solicitudes.value = solicitudesRes.data.data.filter(s => s.estado === 'PENDIENTE').map(s => ({...s, selectedRole: ''}))
    perfiles.value = (perfilesRes.data.data || []).filter(p => {
      const n = p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return !n.includes('lider');
    })
    
    // Get team name from first solicitud if possible, or another call
    if (solicitudesRes.data.data.length > 0) {
        // En una app real, podrías obtener el nombre del equipo por separado
        // Aquí intentaremos inferirlo o usar un valor genérico si está vacío
    }
    
    // Fetch team info to get name
    const teamInfo = await api.get(`/participante/equipos/${route.params.id}/solicitar-info`)
    teamName.value = teamInfo.data.data.nombre

  } catch (error) {
    console.error(error)
    router.push('/participante/dashboard')
  } finally {
    loading.value = false
  }
}

async function responder(solicitud, estado) {  
  if (estado === 'RECHAZADA' && !await alerts.confirm('¿Estás seguro de rechazar esta solicitud?', '¿Rechazar solicitud?')) return
  
  try {
    processing.value = true
    const res = await api.post(`/participante/solicitudes/${solicitud.id}/responder`, {
        estado,
        perfil_id: solicitud.selectedRole || null
    })
    
    message.value = res.data.message
    messageType.value = 'success'
    
    // Refresh list
    await fetchData()
    
    // Clear message after 3s
    setTimeout(() => { message.value = '' }, 3000)
  } catch (error) {
    message.value = error.response?.data?.message || 'Error al procesar la solicitud'
    messageType.value = 'error'
  } finally {
    processing.value = false
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(fetchData)
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.content-container {
  max-width: 56rem;
  margin: 0 auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.alert-box {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.alert-box.success {
  background: #f0fdf4;
  border: 1px solid #dcfce7;
  color: #166534;
}

.alert-box.error {
  background: #fef2f2;
  border: 1px solid #fee2e2;
  color: #991b1b;
}

.empty-state {
  background: white;
  border-radius: 1.5rem;
  padding: 4rem 2rem;
  text-align: center;
  border: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1.5rem;
  color: #d1d5db;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-desc {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.solicitudes-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.solicitud-card {
  background: white;
  border-radius: 1.5rem;
  border: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.solicitud-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 1.5rem;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.user-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
}

.user-meta {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.label {
  font-weight: 700;
}

.date-badge {
  font-size: 0.75rem;
  color: var(--text-muted);
  background: var(--bg-muted);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.message-box {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #eff6ff;
  border-radius: 0.75rem;
  border: 1px solid #dbeafe;
}

.message-text {
  font-size: 0.875rem;
  color: #1e40af;
  line-height: 1.5;
}

.role-request-box {
  margin-bottom: 1.5rem;
  padding: 0.875rem 1.25rem;
  background: #faf5ff; /* purple-50/100ish */
  border-radius: 0.75rem;
  border: 1px solid #e9d5ff; /* purple-200 */
}

.role-text {
  font-size: 0.875rem;
  color: #6b21a8; /* purple-800 */
}

.role-label {
  font-weight: 700;
  margin-right: 0.25rem;
}

.actions-section {
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.role-selector-field {
  margin-bottom: 1.5rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  display: block;
}

.form-select {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  padding: 0.625rem;
  font-size: 0.875rem;
  background-color: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-indigo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #4f46e5;
  color: white;
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 0.875rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-indigo:hover:not(:disabled) {
  background: #4338ca;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-gray {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #4b5563;
  color: white;
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 0.875rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-gray:hover:not(:disabled) {
  background: #374151;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (min-width: 640px) {
  .button-group {
    flex-direction: row;
  }
  
  .btn-indigo, .btn-gray {
    flex: 1;
  }
}
</style>
