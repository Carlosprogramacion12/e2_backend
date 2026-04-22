<template>
  <AppLayout>
    <div style="background:var(--bg-main); min-height:100vh; padding:2rem 3rem">
      <div v-if="loading" style="display:flex; justify-content:center; padding:10rem">
        <div class="spinner"></div>
      </div>

      <div v-else style="max-width:1150px; margin:0 auto">
        
        <!-- Banner Modo Lectura -->
        <div v-if="isFinished" style="margin-bottom:1.5rem; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:1rem; padding:1.25rem 1.75rem; display:flex; align-items:center; gap:1.25rem">
           <div style="background:#64748b; color:#fff; width:3rem; height:3rem; border-radius:0.75rem; display:flex; align-items:center; justify-content:center; flex-shrink:0">
              <svg style="width:1.5rem; height:1.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
           </div>
           <div>
              <h4 style="margin:0; font-size:1rem; font-weight:800; color:#1e293b">Modo de Solo Lectura</h4>
              <p style="margin:2px 0 0; font-size:0.8rem; color:#64748b; font-weight:600">El evento ha concluido. No se permiten más modificaciones en las calificaciones.</p>
           </div>
        </div>

        <!-- Banner Modo Espera (No iniciado) -->
        <div v-if="isNotStarted" style="margin-bottom:1.5rem; background:#fff7ed; border:1px solid #fdba74; border-radius:1rem; padding:1.25rem 1.75rem; display:flex; align-items:center; gap:1.25rem">
           <div style="background:#f59e0b; color:#fff; width:3rem; height:3rem; border-radius:0.75rem; display:flex; align-items:center; justify-content:center; flex-shrink:0">
              <svg style="width:1.5rem; height:1.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           </div>
           <div>
              <h4 style="margin:0; font-size:1rem; font-weight:800; color:#9a3412">Periodo de calificación no iniciado</h4>
              <p style="margin:2px 0 0; font-size:0.8rem; color:#c2410c; font-weight:600">El evento aún no ha comenzado. Podrás calificar una vez que inicie oficialmente.</p>
           </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 300px; gap:2rem; align-items: start">
          
          <!-- COLUMNA IZQUIERDA -->
          <div style="display:flex; flex-direction:column; gap:1.5rem">
            <!-- Project Header Card -->
            <div style="background:var(--bg-card); border-radius:1rem; padding:1.5rem; border-left:5px solid var(--indigo-500); box-shadow:0 4px 12px -2px rgba(0,0,0,0.05)">
              <h2 style="font-size:1.4rem; font-weight:800; color:var(--text-primary); letter-spacing:-0.02em">{{ proyecto.nombre }}</h2>
              <p style="font-size:0.875rem; color:var(--text-secondary); margin-top:0.5rem; line-height:1.5">{{ proyecto.description || 'Califica este proyecto basándote en su desempeño.' }}</p>
            </div>

            <!-- Rubric Card -->
            <div style="background:var(--bg-card); border-radius:1rem; box-shadow:0 4px 12px -2px rgba(0,0,0,0.05); overflow:hidden">
              <div style="padding:1.25rem 1.75rem; border-bottom:1px solid var(--border-color)">
                <h3 style="font-size:1.1rem; font-weight:800; color:var(--text-primary)">Rúbrica de Evaluación</h3>
                <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px">
                  <template v-if="isFinished">Consulta las puntuaciones otorgadas.</template>
                  <template v-else-if="isNotStarted">La rúbrica se habilitará al inicio del evento.</template>
                  <template v-else>Evalúa cada criterio del 0 al 100.</template>
                </p>
              </div>

              <div style="padding:2rem 1.75rem; display:flex; flex-direction:column; gap:2.5rem">
                <div v-for="c in criterios" :key="c.id">
                  <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:1rem">
                    <div style="display:flex; align-items:center; gap:0.6rem">
                      <span style="font-size:0.95rem; font-weight:700; color:var(--text-secondary)">{{ c.nombre }}</span>
                      <span style="background:var(--bg-main); color:var(--text-muted); font-size:0.6rem; font-weight:700; padding:0.2rem 0.5rem; border-radius:4px; text-transform:uppercase">Peso: {{ c.ponderacion }}%</span>
                    </div>
                    <div style="font-size:1.5rem; font-weight:900; line-height:1" :style="{ color: (isFinished || isNotStarted) ? '#94a3b8' : getProgressColor(c.score) }">
                      {{ c.score }}<span style="font-size:0.9rem; font-weight:500; color:var(--text-muted); margin-left:1px">/100</span>
                    </div>
                  </div>

                  <!-- Range Input / Custom Bar -->
                  <div style="position:relative; height:10px; border-radius:99px; background:var(--bg-input); cursor:pointer"
                       :style="{ 
                         background: `linear-gradient(to right, ${ (isFinished || isNotStarted) ? '#cbd5e1' : getProgressColor(c.score)} ${c.score}%, var(--border-color) ${c.score}%)`, 
                         boxShadow: (isFinished || isNotStarted) ? 'none' : `0 0 10px ${getProgressColor(c.score)}22`,
                         opacity: (isFinished || isNotStarted) ? 0.7 : 1
                       }">
                    <input type="range" min="0" max="100" v-model.number="c.score" @input="updateChart" :disabled="isFinished || isNotStarted"
                           class="eval-range" :class="{ 'disabled-range': isFinished || isNotStarted }" :style="{ '--bar-color': (isFinished || isNotStarted) ? '#94a3b8' : getProgressColor(c.score) }">
                  </div>

                  <div style="display:flex; justify-content:space-between; margin-top:0.6rem; font-size:0.6rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em">
                    <span>Deficiente</span>
                    <span>Regular</span>
                    <span>Excelente</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- FEEDBACK CUALITATIVO -->
            <div style="background:var(--bg-card); border-radius:1rem; box-shadow:0 4px 12px -2px rgba(0,0,0,0.05); overflow:hidden">
              <div style="padding:1.25rem 1.75rem; border-bottom:1px solid var(--border-color)">
                <h3 style="font-size:1.1rem; font-weight:800; color:var(--text-primary)">Feedback Cualitativo</h3>
              </div>
              <div style="padding:1.5rem 1.75rem">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem">
                  <h4 style="font-size:0.9rem; font-weight:700; color:var(--text-secondary)">Comentarios y Recomendaciones</h4>
                  <div v-if="!isFinished && !isNotStarted" style="display:flex; gap:0.5rem">
                    <button @click="focusComment" style="color:#94a3b8; background:none; border:none; cursor:pointer; padding:2px"><svg style="width:1rem; height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                    <button @click="clearComment" style="color:#fca5a5; background:none; border:none; cursor:pointer; padding:2px"><svg style="width:1rem; height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                  </div>
                </div>
                
                <textarea id="commentArea" v-model="comentario" rows="4" :disabled="isFinished || isNotStarted"
                          :placeholder="(isFinished || isNotStarted) ? 'Comentarios no disponibles.' : 'Escribe aquí tus observaciones...'"
                          style="width:100%; border-radius:0.75rem; border:1.5px solid var(--border-color); background:var(--bg-input); color:var(--text-primary); padding:1rem; font-size:0.875rem; line-height:1.6; outline:none; transition:all 0.3s; resize:none"
                          :style="(isFinished || isNotStarted) ? 'opacity:0.7; cursor:not-allowed' : ''"
                          class="eval-textarea"></textarea>
                
                <div v-if="!isFinished && !isNotStarted" style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem">
                  <span style="font-size:0.75rem; color:var(--text-muted); display:flex; align-items:center; gap:0.4rem">
                    <svg style="width:0.875rem; height:0.875rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Visible para el equipo.
                  </span>
                  <button @click="saveCommentOnly" class="btn-subir" style="padding:0.5rem 1rem; font-size:0.75rem">
                    Subir
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- COLUMNA DERECHA (CHICA Y ELEGANTE) -->
          <div style="display:flex; flex-direction:column">
            <div style="background:var(--bg-card); border-radius:1.5rem; padding:1.75rem; position:sticky; top:2rem; box-shadow:0 10px 25px -10px rgba(0,0,0,0.08); display:flex; flex-direction:column; align-items:center; width: 100%">
              <h4 style="font-weight:700; font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.15em; margin-bottom:2rem">Calificación Final</h4>
              
              <!-- Chart Container -->
              <div style="position:relative; width:140px; height:140px; margin-bottom:1.75rem">
                <canvas id="scoreDoughnut" width="140" height="140"></canvas>
                <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; top:-2px">
                  <span style="font-size:2.25rem; font-weight:900; color:var(--text-primary); line-height:1; letter-spacing:-0.04em">{{ totalWeightedScore }}</span>
                  <span style="font-size:0.6rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.12em; margin-top:2px">Puntos</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div style="width:100%; border-top:1px solid var(--border-color); padding-top:1.5rem">
                <button v-if="!isFinished && !isNotStarted" @click="save" :disabled="saving" class="btn-save-eval">
                  <svg v-if="!saving" style="width:1.1rem; height:1.1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span style="font-size: 0.95rem; font-weight: 800; letter-spacing: -0.01em">{{ saving ? 'Guardando...' : 'Guardar Evaluación' }}</span>
                </button>
                <button @click="$router.back()" style="width:100%; margin-top:1.25rem; background:none; border:none; color:var(--text-muted); font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.15em; cursor:pointer; transition:all 0.2s" onmouseover="this.style.color='var(--indigo-600)'" onmouseout="this.style.color='var(--text-muted)'">
                  {{ (isFinished || isNotStarted) ? 'VOLVER' : 'CANCELAR' }}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'
import alerts from '../../services/alerts'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const route = useRoute()
const router = useRouter()
const proyecto = ref({})
const criterios = ref([])
const comentario = ref('')
const loading = ref(true)
const saving = ref(false)
let chartInstance = null

const isFinished = computed(() => {
  if (!proyecto.value?.evento?.fecha_fin) return false
  return new Date() > new Date(proyecto.value.evento.fecha_fin)
})

const isNotStarted = computed(() => {
  if (!proyecto.value?.evento?.fecha_inicio) return false
  return new Date() < new Date(proyecto.value.evento.fecha_inicio)
})

const totalWeightedScore = computed(() => {
  if (!criterios.value.length) return '0.0'
  const total = criterios.value.reduce((acc, c) => {
    return acc + ((c.score || 0) * c.ponderacion) / 100
  }, 0)
  return total.toFixed(1)
})

function getProgressColor(score) {
  if (score < 40) return '#f43f5e'
  if (score < 70) return '#f59e0b'
  return '#10b981'
}

async function fetchData() {
  try {
    const r = await api.get(`/juez/evaluacion/${route.params.proyectoId}`)
    const d = r.data.data
    proyecto.value = d.proyecto || {}
    criterios.value = (d.proyecto?.evento?.evaluacion_criterios || []).map(c => ({
      ...c,
      id: Number(c.id),
      score: d.calificacionesPrevias ? (d.calificacionesPrevias[c.id.toString()] || 0) : 0
    }))
    comentario.value = d.comentarioPrevio || ''
    
    setTimeout(() => {
      initChart()
    }, 150)
  } catch(e){
    console.error('Error fetching:', e)
  } finally { loading.value = false }
}

function initChart() {
  const canvas = document.getElementById('scoreDoughnut')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (chartInstance) chartInstance.destroy()

  const isDark = document.documentElement.classList.contains('dark')
  const trackColor = isDark ? '#334155' : '#f1f5f9'
  const primaryColor = '#4f46e5'

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [Number(totalWeightedScore.value), 100 - Number(totalWeightedScore.value)],
        backgroundColor: [primaryColor, trackColor],
        borderWidth: 0,
        borderRadius: 0, 
        spacing: 0
      }]
    },
    options: {
      cutout: '84%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      animation: { duration: 1000, easing: 'easeOutQuart' }
    }
  })
}

function updateChart() {
  if (chartInstance) {
    chartInstance.data.datasets[0].data = [Number(totalWeightedScore.value), 100 - Number(totalWeightedScore.value)]
    chartInstance.update('none')
  }
}

function focusComment() { document.getElementById('commentArea')?.focus() }
async function clearComment() { if (await alerts.confirm('¿Borrar comentario?', '¿Borrar?', 'Sí, borrar', 'Cancelar')) { comentario.value = '' } }
async function saveCommentOnly() {
  if (saving.value) return
  saving.value = true
  try {
    const scores = {}
    criterios.value.forEach(c => {
      scores[c.id.toString()] = c.score
    })
    await api.post(`/juez/evaluacion/${route.params.proyectoId}`, { 
      puntuaciones: scores, 
      comentario: comentario.value 
    })
    alerts.success('¡Comentario subido exitosamente! Ahora el participante podrá verlo.')
  } catch(e) {
    alerts.error(e.response?.data?.message || 'Error al subir comentario.')
  } finally {
    saving.value = false
  }
}

async function save() {
  if (saving.value) return
  saving.value = true
  try {
    const scores = {}
    criterios.value.forEach(c => {
      scores[c.id.toString()] = c.score
    })
    await api.post(`/juez/evaluacion/${route.params.proyectoId}`, { 
      puntuaciones: scores, 
      comentario: comentario.value 
    })
    alerts.success('Evaluación guardada exitosamente.')
    router.back()
  } catch(e) { 
    alerts.error(e.response?.data?.message || 'Error al guardar.') 
  } finally {
    saving.value = false
  }
}

onMounted(fetchData)
onUnmounted(() => { if (chartInstance) chartInstance.destroy() })
</script>

<style scoped>
.eval-range {
  -webkit-appearance: none;
  width: 100%;
  height: 10px;
  background: transparent;
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  z-index: 2;
}

.eval-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: 5px solid var(--bar-color);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.btn-save-eval {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: #4f46e5;
  color: #fff;
  padding: 0.875rem;
  border-radius: 1rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 15px -4px rgba(79, 70, 229, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-save-eval:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 15px 25px -5px rgba(79, 70, 229, 0.5);
}

.btn-subir {
  background: #4f46e5;
  color: #fff;
  font-weight: 800;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.eval-textarea:focus {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.05);
}
</style>
