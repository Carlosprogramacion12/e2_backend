<template>
  <AppLayout>
    <div class="profile-container">
      <h2 class="page-title">Mi Perfil</h2>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>
      <template v-else>
        <!-- Tarjeta de Resumen -->
        <div class="card summary-card">
          <div class="summary-content">
            <div class="avatar">
              {{ initials }}
            </div>
            <div class="info">
              <h3 class="name">{{ auth.user?.name || 'Cargando...' }}</h3>
              <p class="email">{{ auth.user?.email }}</p>
              <div class="badge-role">Participante</div>
            </div>
          </div>
          <div class="summary-footer">
            <div class="footer-item">
              <span class="label">No. Control:</span>
              <span class="value">{{ profileData.no_control || 'No defindo' }}</span>
            </div>
            <div class="footer-item">
              <span class="label">Carrera:</span>
              <span class="value">{{ profileData.carrera || 'No definida' }}</span>
            </div>
          </div>
        </div>

        <!-- Formulario de Información Personal -->
        <div class="card form-card">
          <div class="card-header">
            <h3>Información Personal</h3>
            <p>Actualiza la información de tu cuenta y dirección de correo electrónico.</p>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveProfile">
              <div v-if="successMsg" class="alert-success">{{ successMsg }}</div>
              <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>

              <div class="form-group">
                <label for="name">Nombre Completo</label>
                <input id="name" type="text" v-model="form.nombre" required class="input" />
              </div>

              <div class="form-group">
                <label for="email">Correo Electrónico</label>
                <input id="email" type="email" v-model="form.email" required class="input" />
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label for="no_control">Número de Control</label>
                  <input id="no_control" type="text" v-model="form.no_control" class="input" placeholder="Ej: 20120000" />
                </div>
                
                <div class="form-group">
                  <label for="telefono">Teléfono</label>
                  <input id="telefono" type="text" v-model="form.telefono" class="input" placeholder="Opcional" />
                </div>
              </div>

              <div class="form-group">
                <label for="carrera">Carrera</label>
                <select id="carrera" v-model="form.carrera" class="input">
                  <option value="" disabled>Selecciona una carrera</option>
                  <option v-for="(nombre, idx) in carrerasDisponibles" :key="idx" :value="nombre">
                    {{ nombre }}
                  </option>
                </select>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-indigo" :disabled="saving">
                  {{ saving ? 'Guardando...' : 'Guardar Información' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

const carrerasDisponibles = [
  'Ingeniería en Sistemas Computacionales',
  'Ingeniería Mecánica',
  'Ingeniería Eléctrica',
  'Ingeniería Electrónica',
  'Ingeniería Química',
  'Ingeniería Industrial',
  'Ingeniería Civil',
  'Ingeniería en Gestión Empresarial',
  'Licenciatura en Administración',
  'Contador Público'
]

const auth = useAuthStore()
const loading = ref(true)
const saving = ref(false)
const profileData = ref({})

const successMsg = ref('')
const errorMsg = ref('')

const form = ref({
  nombre: '',
  email: '',
  no_control: '',
  telefono: '',
  carrera: ''
})

const initials = computed(() => {
  if (!auth.user?.name) return 'U'
  return auth.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

const fetchProfile = async () => {
  try {
    const res = await api.get('/auth/me')
    profileData.value = res.data.data
    form.value.nombre = profileData.value.name || ''
    form.value.email = profileData.value.email || ''
    form.value.no_control = profileData.value.no_control || ''
    form.value.telefono = profileData.value.telefono || ''
    form.value.carrera = profileData.value.carrera || ''
  } catch(e) {
    console.error('Error cargando perfil:', e)
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  successMsg.value = ''
  errorMsg.value = ''
  saving.value = true
  try {
    // We update using /admin/usuarios/:id endpoint which works for self-update too
    // Alternatively wait for a cleaner user endpoint, but this one works.
    await api.put(`/admin/usuarios/${auth.user.id}`, form.value)
    successMsg.value = '¡Perfil actualizado correctamente!'
    auth.checkAuth() // reload auth profile details
    await fetchProfile() // reload extra fields
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch(e) {
    errorMsg.value = e.response?.data?.message || 'Error al guardar los cambios'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile-container {
  max-width: 48rem;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #111827);
  margin-bottom: 1.5rem;
}

.card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.summary-card {
  display: flex;
  flex-direction: column;
}

.summary-content {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info .name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary, #111827);
}

.info .email {
  font-size: 0.875rem;
  color: var(--text-secondary, #4b5563);
}

.badge-role {
  display: inline-block;
  align-self: flex-start;
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  margin-top: 0.25rem;
}

.summary-footer {
  background: var(--card-muted, #f9fafb);
  border-top: 1px solid var(--border, #e5e7eb);
  padding: 1rem 1.5rem;
  display: flex;
  gap: 2rem;
}

.footer-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.footer-item .label {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--text-muted, #9ca3af);
  letter-spacing: 0.05em;
}

.footer-item .value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary, #4b5563);
}

.form-card .card-header {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid var(--border, #e5e7eb);
}

.form-card .card-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--text-primary, #111827);
}

.form-card .card-header p {
  font-size: 0.875rem;
  color: var(--text-muted, #6b7280);
}

.form-card .card-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary, #374151);
  margin-bottom: 0.5rem;
}

.input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border, #d1d5db);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: var(--card-bg, #fff);
  color: var(--text-primary, #111827);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-indigo {
  background: #4f46e5;
  color: #fff;
}

.btn-indigo:hover:not(:disabled) {
  background: #4338ca;
}

.alert-success {
  background: #dcfce7;
  color: #166534;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.alert-error {
  background: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}
.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border);
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spinner 1s linear infinite;
}
@keyframes spinner {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
