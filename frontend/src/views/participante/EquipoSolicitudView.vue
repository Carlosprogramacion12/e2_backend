<template>
  <AppLayout>
    <div class="view-viewport">
      <div class="solicitud-form-container">
        <!-- HEADER -->
        <div class="form-header">
          <h1 class="header-title">Enviar Solicitud de Unión</h1>
          <p class="header-desc">El líder del equipo revisará tu solicitud y decidirá si te acepta en el proyecto.</p>
        </div>

        <div v-if="loading" class="loading-full">
          <div class="premium-spinner"></div>
        </div>
        
        <div v-else class="form-content-anim">
          <div class="solicitud-card-main">
            <!-- DECORACIÓN SUPERIOR ORIGINAL LARAVEL -->
            <div class="card-decoration-strip"></div>

            <div class="card-inner-p">
              <!-- TEAM OVERVIEW CARD (BLUE) -->
              <div v-if="equipo" class="team-summary-card">
                <div class="team-icon-box">
                  <!-- ICONO EXACTO DE LARAVEL -->
                  <svg class="team-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div class="team-meta">
                  <h3 class="team-name-text">{{ equipo.nombre }}</h3>
                  <div class="team-details-row">
                    <span class="meta-item">Proyecto: <strong>{{ equipo.proyecto_nombre || 'Sin proyecto' }}</strong></span>
                    <span class="meta-item-separator">•</span>
                    <span class="meta-item">Integrantes: <strong>{{ equipo.miembros }}/5</strong></span>
                  </div>
                </div>
              </div>

              <!-- USER INFORMATION CARD (EXACT LARAVEL STRUCTURE) -->
              <div class="user-details-box">
                <h4 class="details-title">Tu Información</h4>
                <div class="details-grid-lv">
                  <div class="detail-item-lv">
                    <p class="detail-label-lv">Nombre</p>
                    <p class="detail-value-lv">{{ user?.name || 'Cargando...' }}</p>
                  </div>
                  <div class="detail-item-lv">
                    <p class="detail-label-lv">Email</p>
                    <p class="detail-value-lv">{{ user?.email || 'Cargando...' }}</p>
                  </div>
                  <div class="detail-item-lv">
                    <p class="detail-label-lv">No. Control</p>
                    <p class="detail-value-lv">{{ user?.no_control || 'N/A' }}</p>
                  </div>
                  <div class="detail-item-lv">
                    <p class="detail-label-lv">Carrera</p>
                    <p class="detail-value-lv">{{ user?.carrera || 'N/A' }}</p>
                  </div>
                </div>
              </div>

              <!-- FORM FIELDS -->
              <div class="interactive-form-box">
                <div class="form-group-lv">
                  <label class="form-label-lv">Rol Solicitado *</label>
                  <select v-model="form.perfil_id" class="premium-select-lv">
                    <option value="" disabled>-- Selecciona un rol --</option>
                    <option v-for="p in perfiles" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                  </select>
                  <p class="hint-text-lv">Selecciona el rol con el que deseas unirte al equipo</p>
                </div>

                <div class="form-group-lv">
                  <label class="form-label-lv">Mensaje (Opcional)</label>
                  <textarea 
                    v-model="form.mensaje" 
                    class="premium-textarea-lv" 
                    placeholder="Cuéntale al líder por qué quieres unirte a su equipo. Puedes mencionar tus habilidades, experiencia, o motivación..."
                    rows="5"
                  ></textarea>
                  <p class="hint-text-lv">Máximo 500 caracteres</p>
                </div>

                <!-- INFO ALERT (EXACT LARAVEL ICON AND STYLE) -->
                <div class="info-alert-lv">
                  <svg class="info-icon-lv" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p class="info-text-lv">Después de enviar tu solicitud, el líder del equipo la revisará. Recibirás una notificación cuando responda.</p>
                </div>

                <hr class="form-divider-lv" />

                <!-- FOOTER ACTIONS (RIGHT ALIGNED) -->
                <div class="footer-actions-lv">
                  <button class="btn-cancel-lv" @click="$router.back()" :disabled="submitting">
                    Cancelar
                  </button>
                  <button 
                    class="btn-primary-lv" 
                    @click="enviarSolicitud" 
                    :disabled="submitting || !form.perfil_id"
                  >
                    <div v-if="submitting" class="mini-spinner"></div>
                    <template v-else>
                      <svg class="send-icon-lv" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                      </svg>
                      <span>Enviar Solicitud</span>
                    </template>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
const submitting = ref(false)
const equipo = ref(null)
const user = ref(null)
const perfiles = ref([])

const form = ref({
  perfil_id: '',
  mensaje: ''
})

async function loadData() {
  try {
    loading.value = true
    const equipoId = route.params.id
    const [resEquipo, resPerfiles, resMe] = await Promise.all([
      api.get(`/participante/equipos/${equipoId}/solicitar-info`),
      api.get('/participante/perfiles'),
      api.get('/auth/me')
    ])
    equipo.value = resEquipo.data.data
    perfiles.value = (resPerfiles.data.data || []).filter(p => {
      const n = p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return !n.includes('lider');
    })
    user.value = resMe.data.data || resMe.data.user
  } catch (e) {
    console.error('Error loading join form:', e)
    router.push({ name: 'UnirseEquipo' })
  } finally {
    loading.value = false
  }
}

async function enviarSolicitud() {
  try {
    submitting.value = true
    await api.post('/participante/solicitudes', {
      equipo_id: route.params.id,
      perfil_id: form.value.perfil_id,
      mensaje: form.value.mensaje
    })
    alerts.success('Solicitud enviada correctamente.')
    router.push({ name: 'UnirseEquipo' })
  } catch (e) {
    alerts.error(e.response?.data?.message || 'Error al enviar la solicitud.')
  } finally {
    submitting.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.view-viewport {
  min-height: calc(100vh - 64px);
  background-color: #f9fafb;
  font-family: 'Inter', sans-serif;
  padding: 3rem 1rem;
}

.solicitud-form-container {
  max-width: 42rem;
  margin: 0 auto;
}

/* HEADER */
.form-header { margin-bottom: 2rem; }
.header-title { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0; }
.header-desc { font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem; }

/* CARD MAIN */
.solicitud-card-main {
  background: #ffffff;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.card-decoration-strip {
  height: 0.375rem;
  width: 100%;
  background: linear-gradient(to right, #6366f1, #a855f7);
}

.card-inner-p { padding: 2rem; }

/* TEAM BOX (INDIGO) */
.team-summary-card {
  padding: 1rem;
  background-color: #f5f3ff;
  border: 1px solid #ede9fe;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}
.team-icon-box {
  width: 3rem;
  height: 3rem;
  background-color: #4f46e5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
}
.team-icon { width: 1.5rem; height: 1.5rem; }
.team-name-text { font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0; }
.team-details-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem; }
.meta-item { font-size: 0.875rem; color: #4b5563; }
.meta-item strong { color: #111827; font-weight: 600; }
.meta-item-separator { color: #d1d5db; }

/* USER INFO BOX */
.user-details-box {
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #f3f4f6;
  margin-bottom: 2rem;
}
.details-title { font-size: 0.875rem; font-weight: 700; color: #111827; margin-bottom: 0.75rem; }
.details-grid-lv { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.detail-item-lv { }
.detail-label-lv { font-size: 0.875rem; color: #6b7280; margin-bottom: 0.125rem; }
.detail-value-lv { font-size: 0.875rem; font-weight: 600; color: #111827; margin: 0; }

/* FORM GROUPS */
.interactive-form-box { display: flex; flex-direction: column; gap: 1.5rem; }
.form-group-lv { display: flex; flex-direction: column; gap: 0.5rem; }
.form-label-lv { font-size: 0.875rem; font-weight: 700; color: #111827; }

.premium-select-lv {
  width: 100%; border-radius: 0.75rem; border: 1px solid #d1d5db; background: #ffffff;
  padding: 1rem; font-size: 0.875rem; color: #111827; transition: all 0.2s;
}
.premium-select-lv:focus { border-color: #6366f1; ring: 2px solid #6366f1; outline: none; }

.premium-textarea-lv {
  width: 100%; border-radius: 0.75rem; border: 1px solid #d1d5db; background: #ffffff;
  padding: 1rem; font-size: 0.875rem; line-height: 1.625; color: #111827; transition: all 0.2s; resize: none;
}
.premium-textarea-lv:focus { border-color: #6366f1; ring: 2px solid #6366f1; outline: none; }
.hint-text-lv { font-size: 0.75rem; color: #6b7280; margin: 0; }

/* INFO ALERT */
.info-alert-lv {
  background-color: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  align-items: start;
}
.info-icon-lv { width: 1.25rem; height: 1.25rem; color: #3b82f6; flex-shrink: 0; transform: translateY(2px); }
.info-text-lv { font-size: 0.75rem; color: #1d4ed8; margin: 0; line-height: 1.625; }

.form-divider-lv { border: 0; border-top: 1px solid #f3f4f6; margin: 0.5rem 0; }

/* ACTIONS */
.footer-actions-lv { display: flex; align-items: center; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; }
.btn-cancel-lv {
  background: transparent; border: none; font-size: 0.875rem; font-weight: 500; color: #6b7280; cursor: pointer; transition: color 0.2s;
}
.btn-cancel-lv:hover { color: #111827; }

.btn-primary-lv {
  height: 3rem; background-color: #4f46e5; color: #ffffff; border: none; border-radius: 0.75rem;
  padding: 0 1.5rem; font-weight: 700; font-size: 0.875rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
  transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
}
.btn-primary-lv:hover:not(:disabled) { background-color: #4338ca; transform: translateY(-0.125rem); }
.btn-primary-lv:disabled { background-color: #94a3b8; cursor: not-allowed; box-shadow: none; transform: none; }

.send-icon-lv { width: 1.25rem; height: 1.25rem; }

.loading-full { display: flex; justify-content: center; padding: 5rem 0; }
.premium-spinner { width: 2.5rem; height: 2.5rem; border: 3px solid #f3f4f6; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }
.mini-spinner { width: 1.25rem; height: 1.25rem; border: 2px solid rgba(255,255,255,0.3); border-top-color: #ffffff; border-radius: 50%; animation: spin 0.8s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(1rem); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 640px) {
  .card-inner-p { padding: 1.5rem; }
  .details-grid-lv { grid-template-columns: 1fr; }
  .footer-actions-lv { flex-direction: column-reverse; gap: 1rem; }
  .btn-primary-lv { width: 100%; justify-content: center; }
}
</style>
