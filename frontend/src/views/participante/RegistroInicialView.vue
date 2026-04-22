<template>
  <AppLayout>
    <div class="registration-container">
      <div class="registration-inner">
        <!-- Main Card -->
        <div class="registration-card card">
          
          <!-- Card Header with Gradient -->
          <div class="registration-header">
            <div class="header-icon-container">
              <svg class="header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <div class="header-content">
              <h3>Información Académica</h3>
              <p>Completa tus datos escolares para continuar al panel principal.</p>
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <form @submit.prevent="save" class="registration-form">
              
              <!-- Matrícula -->
              <div class="form-group">
                <label>Número de Control / Matrícula</label>
                <div class="input-with-icon">
                  <div class="icon-wrapper">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .6.4 1 1 1s1-.4 1-1m0 0H9m4 0h1m-5 4h6m-6 4h6"></path></svg>
                  </div>
                  <input v-model="form.no_control" 
                         type="text" 
                         required 
                         maxlength="8" 
                         minlength="8" 
                         placeholder="Ej: 20210345"
                         class="form-control padded-input" />
                </div>
              </div>

              <!-- Carrera Searchable Dropdown -->
              <div class="form-group">
                <label>Carrera de Estudios</label>
                <div class="dropdown-wrapper" ref="dropdownRef">
                  <div class="input-with-icon">
                    <div class="icon-wrapper">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                    <button type="button" 
                            @click="dropdownOpen = !dropdownOpen"
                            class="form-control padded-input dropdown-trigger">
                      <span v-if="form.carrera" class="selected-text">{{ form.carrera }}</span>
                      <span v-else class="placeholder-text">Selecciona tu carrera</span>
                      <svg class="arrow-icon" :class="{'rotate-180': dropdownOpen}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>

                  <!-- Dropdown Menu -->
                  <div v-show="dropdownOpen" class="dropdown-menu">
                    <div class="dropdown-search">
                      <input v-model="searchQuery" 
                             ref="searchInput"
                             type="text" 
                             placeholder="Buscar carrera..." 
                             class="form-control search-input"
                             @click.stop />
                    </div>
                    <ul class="dropdown-list">
                       <li v-for="carrera in filteredCarreras" 
                           :key="carrera.id"
                           @click="selectCarrera(carrera.nombre)"
                           :class="{'active': form.carrera === carrera.nombre}">
                         {{ carrera.nombre }}
                         <svg v-if="form.carrera === carrera.nombre" class="check-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                       </li>
                       <li v-if="filteredCarreras.length === 0" class="no-results">
                          No se encontraron carreras
                       </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Teléfono -->
              <div class="form-group">
                <label>Número Telefónico</label>
                <div class="input-with-icon">
                  <div class="icon-wrapper">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                  <input v-model="form.telefono" 
                         type="tel" 
                         required 
                         maxlength="10" 
                         minlength="10" 
                         placeholder="Ej: 951 123 4567"
                         class="form-control padded-input" />
                </div>
                <p class="help-text">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Necesario para contacto directo durante el evento.
                </p>
              </div>

              <!-- Submit Button -->
              <div class="form-actions">
                <button type="submit" 
                        :disabled="saving"
                        class="btn btn-indigo btn-block save-btn">
                  <span v-if="saving" class="spinner-small"></span>
                  <span v-else class="btn-text">
                    Guardar y Continuar
                    <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                  </span>
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
import { ref, onMounted, computed, nextTick, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'
import alerts from '../../services/alerts'

const router = useRouter()
const saving = ref(false)
const dropdownOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)
const dropdownRef = ref(null)
const carreras = ref([])

const form = ref({
  no_control: '',
  carrera: '',
  telefono: ''
})

const filteredCarreras = computed(() => {
  if (!searchQuery.value) return carreras.value
  const q = searchQuery.value.toLowerCase()
  return carreras.value.filter(c => c.nombre.toLowerCase().includes(q))
})

function selectCarrera(nombre) {
  form.value.carrera = nombre
  dropdownOpen.value = false
  searchQuery.value = ''
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false
  }
}

onMounted(async () => {
  document.addEventListener('mousedown', handleClickOutside)
  try {
    const r = await api.get('/participante/dashboard/registro-inicial')
    carreras.value = r.data.data.carreras
    form.value = { ...r.data.data.user }
  } catch (e) {
    console.error(e)
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

watch(dropdownOpen, (open) => {
  if (open) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})

async function save() {
  if (saving.value) return
  
  if (!form.value.carrera) {
    alerts.warning('Por favor selecciona una carrera')
    return
  }

  saving.value = true
  
  // Limpiar espacios y caracteres no deseados
  const sanitizedForm = {
    no_control: form.value.no_control.replace(/\D/g, ''),
    carrera: form.value.carrera.trim(),
    telefono: form.value.telefono.replace(/\D/g, '')
  }

  try {
    const r = await api.post('/participante/dashboard/registro-inicial', sanitizedForm)
    if (r.data.success) {
      const auth = useAuthStore()
      await auth.fetchMe() // Refresh the user object in store to unlock the router
      router.push('/participante/dashboard')
    }
  } catch (e) {
    alerts.error(e.response?.data?.message || 'Error al guardar los datos')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.registration-container {
  padding: 3rem 1rem;
  min-height: calc(100vh - 64px);
  display: flex;
  justify-content: center;
}

.registration-inner {
  width: 100%;
  max-width: 40rem;
}

.registration-card {
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
}

.registration-header {
  padding: 2rem;
  background: var(--card-muted);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon-container {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1rem;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--indigo-500);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.header-icon {
  width: 2rem;
  height: 2rem;
}

.header-content h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.header-content p {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.card-body {
  padding: 2.5rem;
}

.registration-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.input-with-icon {
  position: relative;
}

.icon-wrapper {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-muted);
  pointer-events: none;
  z-index: 1;
}

.padded-input {
  padding-left: 3rem !important;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  cursor: pointer;
  background: #fff;
}

.dark .dropdown-trigger {
  background: #374151;
}

.selected-text {
  color: var(--text-primary);
}

.placeholder-text {
  color: var(--text-muted);
}

.arrow-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.3s ease;
}

.dropdown-wrapper {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: var(--bg-card);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  z-index: 100;
  overflow: hidden;
}

.dropdown-search {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.search-input {
  padding: 0.5rem 0.75rem !important;
  font-size: 0.875rem !important;
}

.dropdown-list {
  max-height: 15rem;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
}

.dropdown-list li {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.2s;
  color: var(--text-secondary);
}

.dropdown-list li:hover {
  background: var(--card-muted);
}

.dropdown-list li.active {
  background: var(--indigo-50);
  color: var(--indigo-600);
  font-weight: 700;
}

.dark .dropdown-list li.active {
  background: var(--bg-input);
  color: var(--indigo-400);
}

.check-icon {
  width: 1rem;
  height: 1rem;
}

.no-results {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
}

.help-text {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.save-btn {
  padding: 1rem !important;
  font-size: 1rem !important;
  font-weight: 800 !important;
  border-radius: 1rem !important;
  transition: all 0.3s;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
}

.btn-text {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-small {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.rotate-180 { transform: rotate(180deg); }
</style>
