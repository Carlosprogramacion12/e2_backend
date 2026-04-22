<template>
  <AppLayout>
    <div class="profile-page">
      <!-- Top Header Row -->
      <div class="profile-header">
        <h2 class="title">Mi Perfil</h2>
        <div class="breadcrumbs">
          <span>Dashboard</span>
          <span class="separator">/</span>
          <span class="current">Perfil</span>
        </div>
      </div>

      <!-- Main Profile Card -->
      <div class="card overview-card">
        <!-- Avatar Section -->
        <div class="profile-summary">
          <div class="avatar-wrapper">
            <div class="avatar-circle" :style="avatarStyle">
              <img v-if="auth.user?.id && !avatarFailed" 
                   :src="`/uploads/avatars/${auth.user.id}.jpg?v=${avatarVersion}`" 
                   alt="Avatar" 
                   @error="avatarFailed = true" />
              <span v-else>{{ initials }}</span>
              
              <!-- Pencil Icon for upload -->
              <button class="avatar-edit-btn" @click="$refs.fileInput.click()" title="Cambiar foto">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
              </button>
              <!-- MOD: Ensure class "hidden-input" is used to hide correctly -->
              <input type="file" ref="fileInput" class="hidden-input" @change="handleAvatarUpload" accept="image/*" />
            </div>
          </div>
          
          <div class="user-details">
            <h1 class="user-name">{{ auth.user?.name }}</h1>
            <p class="user-email">{{ auth.user?.email }}</p>
            <div class="badge-role">Participante</div>
          </div>
        </div>

        <!-- Academic Info Box -->
        <div class="academic-info-box">
          <div class="academic-section">
            <span class="academic-label">No. Control:</span>
            <span class="academic-value">{{ form.no_control || 'Sin definir' }}</span>
          </div>
          <div class="vertical-divider"></div>
          <div class="academic-section">
            <span class="academic-label">Carrera:</span>
            <span class="academic-value">{{ form.carrera || 'Sin definir' }}</span>
          </div>
        </div>
      </div>

      <!-- Settings Cards -->
      <div class="settings-content">
        <!-- Información Personal -->
        <div class="card formal-card">
          <div class="card-header">
            <h3>Información Personal</h3>
          </div>
          <div class="card-body">
            <p class="description-text">Actualiza la información de tu perfil y dirección de correo electrónico.</p>
            <form @submit.prevent="saveProfile" class="formal-form mt-4">
              <div v-if="successMsg" class="alert-success">{{ successMsg }}</div>
              <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>

              <div class="form-grid">
                <div class="form-group">
                  <label>Nombre Completo</label>
                  <input v-model="form.nombre" type="text" required class="formal-control" />
                </div>
                <div class="form-group">
                  <label>Correo Electrónico</label>
                  <input v-model="form.email" type="email" required class="formal-control" />
                </div>
              </div>

              <div class="form-grid mt-4">
                <div class="form-group">
                  <label>Número de Control</label>
                  <input v-model="form.no_control" type="text" maxlength="8" class="formal-control" />
                </div>
                <div class="form-group">
                  <label>Teléfono</label>
                  <input v-model="form.telefono" type="text" maxlength="10" class="formal-control" />
                </div>
              </div>

              <!-- Searchable Career Dropdown -->
              <div class="form-group mt-4">
                <label>Carrera</label>
                <div class="dropdown-wrapper" ref="dropdownRef">
                  <button type="button" 
                          @click="dropdownOpen = !dropdownOpen"
                          class="formal-control dropdown-trigger">
                    <span v-if="form.carrera">{{ form.carrera }}</span>
                    <span v-else class="text-gray-400">Selecciona tu carrera</span>
                    <svg class="chevron" :class="{'rotate-180': dropdownOpen}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  <div v-show="dropdownOpen" class="dropdown-menu">
                    <div class="search-box">
                      <input v-model="searchQuery" 
                             ref="searchInput"
                             placeholder="Buscar carrera..." 
                             class="search-input"
                             @click.stop />
                    </div>
                    <ul class="dropdown-list">
                      <li v-for="c in filteredCarreras" 
                          :key="c.id"
                          @click="selectCarrera(c.nombre)"
                          :class="{active: form.carrera === c.nombre}">
                        {{ c.nombre }}
                      </li>
                      <li v-if="filteredCarreras.length === 0" class="no-results">No se encontraron carreras</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <button type="submit" class="btn btn-save" :disabled="saving">
                  <span v-if="saving" class="spinner-inline"></span>
                  <span v-else>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Seguridad / Contraseña -->
        <div class="card formal-card mt-6">
          <div class="card-header">
            <h3>Actualizar Contraseña</h3>
          </div>
          <div class="card-body">
            <p class="description-text">Asegúrese de que su cuenta utilice una contraseña larga y aleatoria para mantener su seguridad.</p>
            <form @submit.prevent="savePassword" class="formal-form mt-4">
              <div v-if="pwdSuccessMsg" class="alert-success">{{ pwdSuccessMsg }}</div>
              <div v-if="pwdErrorMsg" class="alert-error">{{ pwdErrorMsg }}</div>

              <div class="form-group">
                <label>Contraseña Actual</label>
                <input v-model="formPwd.current_password" type="password" required class="formal-control" />
              </div>

              <div class="form-group mt-4">
                <label>Contraseña Nueva</label>
                <input v-model="formPwd.password" type="password" required class="formal-control" />
              </div>

              <div class="form-group mt-4">
                <label>Confirmar Contraseña</label>
                <input v-model="formPwd.password_confirmation" type="password" required class="formal-control" />
              </div>

              <div class="card-footer">
                <button type="submit" class="btn btn-save" :disabled="savingPwd">
                  <span v-if="savingPwd" class="spinner-inline"></span>
                  <span v-else>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import { useAuthStore } from '../../stores/auth.store'
import api from '../../plugins/axios'
import alerts from '../../services/alerts'

const auth = useAuthStore()
const loading = ref(true)
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const savingPwd = ref(false)
const pwdSuccessMsg = ref('')
const pwdErrorMsg = ref('')

// Dropdown logic
const dropdownOpen = ref(false)
const dropdownRef = ref(null)
const searchQuery = ref('')
const searchInput = ref(null)
const carreras = ref([])

const avatarFailed = ref(false)
const avatarVersion = computed(() => auth.avatarVersion)

const form = ref({
  nombre: '',
  email: '',
  no_control: '',
  telefono: '',
  carrera: ''
})

const formPwd = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
})

const initials = computed(() => {
  if (!auth.user?.name) return 'U'
  return auth.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

const avatarStyle = computed(() => {
  return !auth.user?.id || avatarFailed.value 
    ? { background: 'var(--indigo-100)', color: 'var(--indigo-700)' }
    : {}
})

const filteredCarreras = computed(() => {
  if (!searchQuery.value) return carreras.value
  const q = searchQuery.value.toLowerCase()
  return carreras.value.filter(c => c.nombre.toLowerCase().includes(q))
})

function selectCarrera(name) {
  form.value.carrera = name
  dropdownOpen.value = false
  searchQuery.value = ''
}

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

async function fetchProfile() {
  try {
    const [resMe, resCarreras] = await Promise.all([
      api.get('/auth/me'),
      api.get('/participante/dashboard/registro-inicial')
    ])
    
    const user = resMe.data.data
    form.value = {
      nombre: user.name || '',
      email: user.email || '',
      no_control: user.no_control || '',
      telefono: user.telefono || '',
      carrera: user.carrera || ''
    }
    
    carreras.value = resCarreras.data.data.carreras
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  successMsg.value = ''
  errorMsg.value = ''
  saving.value = true
  
  const payload = {
    ...form.value,
    no_control: form.value.no_control?.toString().replace(/\D/g, ''),
    telefono: form.value.telefono?.toString().replace(/\D/g, ''),
    name: form.value.nombre
  }

  try {
    await api.put('/auth/profile', payload)
    successMsg.value = '¡Perfil actualizado correctamente!'
    await auth.fetchMe()
    setTimeout(() => successMsg.value = '', 4000)
  } catch(e) {
    errorMsg.value = e.response?.data?.message || 'Error al guardar los cambios'
  } finally {
    saving.value = false
  }
}

async function savePassword() {
  pwdSuccessMsg.value = ''
  pwdErrorMsg.value = ''
  
  if (formPwd.value.password !== formPwd.value.password_confirmation) {
    pwdErrorMsg.value = 'Las contraseñas no coinciden'
    return
  }

  savingPwd.value = true
  try {
    await api.put('/auth/password', formPwd.value)
    pwdSuccessMsg.value = 'Contraseña actualizada correctamente'
    formPwd.value = { current_password: '', password: '', password_confirmation: '' }
    setTimeout(() => pwdSuccessMsg.value = '', 4000)
  } catch(e) {
    pwdErrorMsg.value = e.response?.data?.message || 'Error al actualizar la contraseña'
  } finally {
    savingPwd.value = false
  }
}

async function handleAvatarUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  
  const formData = new FormData()
  formData.append('avatar', file)
  
  try {
    await api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    auth.updateAvatarVersion()
    avatarFailed.value = false
    // Force immediate UI feedback if needed
  } catch(e) {
    alerts.error(e.response?.data?.message || 'Error al subir imagen')
  }
}

// Watch for avatar version changes to reset failed state
watch(avatarVersion, () => {
  avatarFailed.value = false
})

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  fetchProfile()
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

watch(dropdownOpen, (val) => {
  if (val) nextTick(() => searchInput.value?.focus())
})
</script>

<style scoped>
.profile-page {
  padding: 2rem;
  max-width: 60rem; /* Reduced width for better symmetry */
  margin: 0 auto;
}

/* Header Row */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-header .title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.breadcrumbs .current {
  color: var(--indigo-500);
  font-weight: 500;
}

.breadcrumbs .separator {
  color: var(--border-color);
}

/* Card General */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

/* Overview Card */
.overview-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 1.25rem;
}

.avatar-circle {
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  border: 4px solid var(--bg-card);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  overflow: hidden;
  position: relative;
  background: var(--card-muted);
  color: var(--text-muted);
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0.25rem;
  right: 0.25rem;
  width: 2rem;
  height: 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
}

.avatar-edit-btn:hover {
  background: var(--card-muted);
  transform: scale(1.05);
}

.avatar-edit-btn svg {
  width: 1.125rem;
  height: 1.125rem;
}

.hidden-input {
  display: none !important;
}

.user-details {
  text-align: center;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.user-email {
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.badge-role {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--card-muted);
  color: var(--indigo-500);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
}

/* Academic Box */
.academic-info-box {
  width: 100%;
  max-width: 42rem;
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.125rem;
  display: flex;
  align-items: center;
  background: var(--card-muted);
}

.academic-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.academic-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.academic-value {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.vertical-divider {
  width: 1px;
  height: 3rem;
  background: var(--border-color);
}

/* Formal Cards */
.formal-card .card-header {
  padding: 1.5rem 2rem !important;
  border-bottom: 1px solid var(--border-color) !important;
}

.formal-card .card-header h3 {
  font-size: 1.1rem !important;
  font-weight: 700 !important;
  color: #111827 !important;
  margin: 0 !important;
  padding: 0 !important;
  text-align: left !important;
}

.formal-card .card-body {
  padding: 1.5rem 2rem !important;
}

.formal-form {
  width: 100%;
}

.description-text {
  font-size: 0.875rem !important;
  color: var(--text-muted) !important;
  margin-bottom: 1.25rem !important; /* Proper distance to the form */
  margin-top: 0 !important; /* Remove any top margin to bring it 'up' */
  text-align: left !important;
  width: 100% !important;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.formal-control {
  width: 100%;
  padding: 0.625rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
  background: var(--bg-input);
  color: var(--text-primary);
}

.formal-control:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 1px #4f46e5;
}

/* Dropdown */
.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-input);
  text-align: left;
}

.chevron { width: 1rem; transition: transform 0.2s; }
.rotate-180 { transform: rotate(180deg); }

.dropdown-wrapper { position: relative; }
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  margin-top: 0.25rem;
  z-index: 50;
}

.search-box { padding: 0.5rem; border-bottom: 1px solid var(--border-color); }
.search-input {
  width: 100%;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  font-size: 0.8125rem;
  background: var(--bg-input);
  color: var(--text-primary);
}

.dropdown-list {
  max-height: 12rem;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-list li {
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.dropdown-list li:hover { background: var(--card-muted); }
.dropdown-list li.active { background: var(--card-muted); color: var(--indigo-500); font-weight: 600; }

.card-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  background: var(--indigo-600);
  color: #fff;
  padding: 0.6rem 1.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  transition: all 0.2s;
}

.btn-save:hover { 
  background: var(--indigo-700);
  transform: translateY(-1px);
}

.alert-success { background: #ecfdf5; color: #065f46; padding: 1rem; border-radius: 0.375rem; margin-bottom: 1rem; font-size: 0.875rem; }
.alert-error { background: #fef2f2; color: #991b1b; padding: 1rem; border-radius: 0.375rem; margin-bottom: 1rem; font-size: 0.875rem; }

.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }

.spinner-inline {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin { to { transform: rotate(360deg); } }


</style>
