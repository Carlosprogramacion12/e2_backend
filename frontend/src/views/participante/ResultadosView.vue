<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
      <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary);margin:0">Ranking de Proyectos</h2>
      
      <!-- Selector de Evento (Pill Style) -->
      <div v-if="eventos.length > 1" style="display:flex;align-items:center;gap:.75rem">
        <span style="font-size:.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase">Evento Seleccionado:</span>
        <select v-model="selectedEventoId" :disabled="loading" class="modal-select">
          <option v-for="e in eventos" :key="e.id" :value="e.id">
            {{ e.nombre }}
          </option>
        </select>
      </div>
    </div>

    <!-- Spinner -->
    <div v-if="loading" style="padding:4rem;text-align:center"><div class="spinner"></div></div>

    <!-- Estado: No Enrolado (Sin equipo o evento) -->
    <div v-else-if="!isEnrolled" class="empty-state" style="border-style: solid; border-color: var(--indigo-100);">
      <div style="background:rgba(79,70,229,0.1); padding:1rem; border-radius:9999px; margin-bottom:1.5rem">
        <svg style="width:2rem; height:2rem; color:var(--indigo-500)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      </div>
      <h3 style="font-size:1.25rem; font-weight:800; color:var(--text-primary); margin:0">Identidad del Proyecto Requerida</h3>
      <p style="font-size:.875rem; color:var(--text-muted); text-align:center; max-width:24rem; margin:0.75rem 0 0">
        Actualmente no pareces estar registrado en un equipo para ningún evento activo. 
        Los resultados solo están disponibles para los competidores registrados.
      </p>
    </div>

    <!-- Sin Resultados o Evento en Curso (Enrolado pero aún sin datos o tiempo) -->
    <div v-else-if="ranking.length === 0 || !estaFinalizado" class="empty-state">
      <div style="background:var(--card-muted);padding:1rem;border-radius:9999px;margin-bottom:1rem">
        <svg style="width:2.5rem;height:2.5rem;color:#9ca3af" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      
      <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary);margin:0">
        {{ !estaFinalizado ? 'Evento en Progreso' : 'Resultados Próximamente' }}
      </h3>

      <!-- Contador Regresivo -->
      <div v-if="!estaFinalizado && timeLeft" class="countdown-container">
        <div class="countdown-item">
          <span class="countdown-val">{{ timeLeft.days }}</span>
          <span class="countdown-lab">Días</span>
        </div>
        <div class="countdown-divider">:</div>
        <div class="countdown-item">
          <span class="countdown-val">{{ String(timeLeft.hours).padStart(2, '0') }}</span>
          <span class="countdown-lab">Hrs</span>
        </div>
        <div class="countdown-divider">:</div>
        <div class="countdown-item">
          <span class="countdown-val">{{ String(timeLeft.minutes).padStart(2, '0') }}</span>
          <span class="countdown-lab">Min</span>
        </div>
        <div class="countdown-divider">:</div>
        <div class="countdown-item">
          <span class="countdown-val">{{ String(timeLeft.seconds).padStart(2, '0') }}</span>
          <span class="countdown-lab">Seg</span>
        </div>
      </div>

      <p style="font-size:.875rem;color:var(--text-muted);text-align:center;max-width:24rem;margin:.25rem 0 0">
        {{ !estaFinalizado 
            ? 'Los resultados oficiales se podrán consultar al finalizar el tiempo.' 
            : 'Las evaluaciones están siendo procesadas. El ranking final estará disponible en breve.' 
        }}
      </p>
    </div>

    <!-- Podio y Tabla -->
    <div v-else>
      <!-- Header con info del evento -->
      <div v-if="eventoActual" style="background:var(--card-muted); padding:1rem 1.5rem; border-radius:1rem; margin-bottom:2rem; border:1px solid var(--border-color); display:flex; align-items:center; gap:1rem">
        <div style="padding:.5rem; background:rgba(79,70,229,0.1); color:var(--indigo-500); border-radius:.5rem">
          <svg style="width:1.5rem; height:1.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        </div>
        <div>
          <div v-if="eventoActual" style="margin-bottom: 0.25rem;">
            <span v-if="new Date() < new Date(eventoActual.fecha_inicio)" style="font-size: 0.6rem; font-weight: 800; text-transform: uppercase; background: #fff7ed; color: #c2410c; padding: 2px 8px; border-radius: 4px; border: 1px solid #fdba74;">
              Próximo
            </span>
            <span v-else-if="new Date() > new Date(eventoActual.fecha_fin)" style="font-size: 0.6rem; font-weight: 800; text-transform: uppercase; background: #f3f4f6; color: #4b5563; padding: 2px 8px; border-radius: 4px; border: 1px solid #d1d5db;">
              Finalizado
            </span>
            <span v-else style="font-size: 0.6rem; font-weight: 800; text-transform: uppercase; background: #f0fdf4; color: #15803d; padding: 2px 8px; border-radius: 4px; border: 1px solid #86efac;">
              Activo
            </span>
          </div>
          <h3 style="font-size:1rem; font-weight:800; color:var(--text-primary); margin:0">{{ eventoActual?.nombre }}</h3>
        </div>
      </div>
      
      <!-- PODIO DE GANADORES (TOP 3) -->
      <div class="podium-grid">
        <!-- 2do Lugar (Plata) -->
        <div v-if="ranking[1]" class="podium-item podium-silver">
          <div class="podium-glow silver-glow"></div>
          <div class="podium-card silver-card">
            <div class="badge-wrapper">
              <div class="badge silver-badge">2</div>
              <div class="badge-icon"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
            </div>
            <h3 class="podium-name">{{ ranking[1].nombre }}</h3>
            <p class="podium-team">{{ ranking[1].equipo }}</p>
            <div class="podium-footer">
              <div class="score-box silver-score">
                <span class="score-num">{{ formatNumber(ranking[1].puntaje) }}</span>
                <span class="score-label">Puntos</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 1er Lugar (Oro) -->
        <div v-if="ranking[0]" class="podium-item podium-gold">
          <div class="podium-glow gold-glow"></div>
          <div class="podium-card gold-card">
            <div class="badge-wrapper">
              <div class="badge gold-badge">1</div>
              <div class="badge-icon gold-icon"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
            </div>
            <h3 class="podium-name gold-name">{{ ranking[0].nombre }}</h3>
            <p class="podium-team gold-team">{{ ranking[0].equipo }}</p>
            <div class="podium-footer">
              <div class="score-box gold-score">
                <span class="score-num">{{ formatNumber(ranking[0].puntaje) }}</span>
                <span class="score-label">Puntos Totales</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3er Lugar (Bronce) -->
        <div v-if="ranking[2]" class="podium-item podium-bronze">
          <div class="podium-glow bronze-glow"></div>
          <div class="podium-card bronze-card">
            <div class="badge-wrapper">
              <div class="badge bronze-badge">3</div>
              <div class="badge-icon"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
            </div>
            <h3 class="podium-name">{{ ranking[2].nombre }}</h3>
            <p class="podium-team">{{ ranking[2].equipo }}</p>
            <div class="podium-footer">
              <div class="score-box bronze-score">
                <span class="score-num">{{ formatNumber(ranking[2].puntaje) }}</span>
                <span class="score-label">Puntos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TABLA DE POSICIONES -->
      <div v-if="ranking.length > 0" class="participants-table-container" style="margin-top: 3rem;">
        <div class="table-header-box">
          <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary);margin:0">Clasificación General</h3>
        </div>
        <div style="overflow-x:auto">
          <table class="participants-table">
            <thead>
              <tr>
                <th style="width:5rem;text-align:center">Posición</th>
                <th>Proyecto / Equipo</th>
                <th style="text-align:right">Puntaje</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in ranking" :key="item.id" class="table-row-hover">
                <td style="text-align:center;font-weight:800;color:var(--text-muted);font-size:1.125rem">
                  {{ idx + 1 }}
                </td>
                <td>
                  <p style="font-weight:700;color:var(--text-primary);font-size:.875rem;margin:0 0 .25rem">{{ item.nombre }}</p>
                  <p style="font-size:.75rem;color:var(--text-muted);margin:0">{{ item.equipo }}</p>
                </td>
                <td style="text-align:right">
                  <span class="table-score-pill">
                    {{ formatNumber(item.puntaje) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'

const ranking = ref([])
const eventos = ref([]) // Lista de todos los eventos
const loading = ref(true)
const isEnrolled = ref(true)
const isFinishedServer = ref(false)
const serverTimeOffset = ref(0)
const eventoActual = ref(null)
const selectedEventoId = ref(null)
const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let timer = null

const estaFinalizado = computed(() => {
  return isFinishedServer.value
})

onMounted(async () => {
  await fetchData()
  startTimer()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function startTimer() {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (!eventoActual.value || isFinishedServer.value) return
    
    // Sincronizar 'ahora' con el offset del servidor
    const now = new Date().getTime() - serverTimeOffset.value
    const end = new Date(eventoActual.value.fecha_fin).getTime()
    const diff = end - now

    if (diff <= 0) {
      timeLeft.value = null
      isFinishedServer.value = true // El tiempo se agotó localmente sincronizado con el server
      clearInterval(timer)
      return
    }

    timeLeft.value = {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    }
  }, 1000)
}

async function fetchData(eventoId = null) {
  loading.value = true
  try {
    const params = {}
    if (eventoId) params.evento_id = eventoId
    
    const { data } = await api.get('/participante/resultados', { params })
    eventoActual.value = data.data.evento
    eventos.value = data.data.eventos || []
    isEnrolled.value = data.data.isEnrolled
    isFinishedServer.value = data.data.isFinished
    ranking.value = data.data.ranking || []

    // Si no tenemos un evento seleccionado, tomamos el actual que devuelve el servidor
    if (!selectedEventoId.value && eventoActual.value) {
      selectedEventoId.value = eventoActual.value.id
    }

    // Calcular offset del servidor para que el contador sea exacto
    if (data.data.serverTime) {
      const serverTimeMillis = new Date(data.data.serverTime).getTime()
      const localTimeMillis = new Date().getTime()
      serverTimeOffset.value = localTimeMillis - serverTimeMillis
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

import { watch } from 'vue'
watch(selectedEventoId, (newId) => {
  if (newId) {
    fetchData(newId)
  }
})

function formatNumber(num) {
  return Number(num).toFixed(1)
}

function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped>
.btn-primary { 
  display: inline-block;
  padding: .75rem 1.5rem; 
  background: var(--indigo-600); 
  color: white; 
  border-radius: .75rem; 
  font-weight: 700; 
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
}
.btn-primary:hover { background: var(--indigo-700); transform: translateY(-1px); }

.card-box { background: var(--bg-card); padding: 1.25rem 1.5rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,.05); border: 1px solid var(--border-color); }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 2rem; background: var(--bg-card); border-radius: 1.25rem; border: 2px dashed var(--border-color); text-align: center; }

/* Contador Estilos */
.countdown-container { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin: 2rem 0; background: var(--card-muted); padding: 1.5rem 2rem; border-radius: 1.25rem; border: 1px solid var(--border-color); box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
.countdown-item { display: flex; flex-direction: column; align-items: center; min-width: 3.5rem; }
.countdown-val { font-size: 2.25rem; font-weight: 900; color: var(--indigo-600); line-height: 1; font-family: 'Inter', sans-serif; }
.countdown-lab { font-size: 0.65rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-top: 0.5rem; }
.countdown-divider { font-size: 1.5rem; font-weight: 700; color: var(--border-color); margin-top: -1rem; }

.podium-grid {
  display: grid;
  gap: 1.5rem;
  align-items: flex-end;
  margin-bottom: 4rem;
  position: relative;
  z-index: 10;
}
@media (min-width: 768px) {
  .podium-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .podium-silver { order: 1; }
  .podium-gold { order: 2; margin-top: -5rem; }
  .podium-bronze { order: 3; }
}

.podium-item { position: relative; height: 100%; transition: transform 0.3s ease; }
.podium-glow { position: absolute; inset: 0; border-radius: 1.5rem; filter: blur(24px); opacity: 0.2; }

.podium-card {
  position: relative;
  background: var(--bg-card);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
  border: 1px solid var(--border-color);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease, border-color 0.4s ease;
}

.podium-item:hover .podium-card {
  transform: translateY(-1rem);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.podium-item:hover .podium-glow {
  opacity: 0.5;
  filter: blur(32px);
}

.podium-gold { z-index: 20; transform: scale(1.05); }
.gold-glow { background: linear-gradient(to bottom, #fde047, #eab308); opacity: 0.3; }
.podium-gold .podium-card { padding: 2.25rem 2rem; border-top: 5px solid #facc15; }
.silver-card { border-top: 5px solid #9ca3af; }
.silver-glow { background: linear-gradient(to bottom, #e5e7eb, #9ca3af); }
.bronze-card { border-top: 5px solid #fb923c; }
.bronze-glow { background: linear-gradient(to bottom, #fed7aa, #fb923c); }

.podium-name { font-size: 1.125rem; font-weight: 800; color: var(--text-primary); margin-bottom: .25rem; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.3; }
.podium-team { font-size: .75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 1.75rem; letter-spacing: 0.05em; }
.gold-name { font-size: 1.5rem; }

.badge-wrapper { margin-bottom: 1.25rem; position: relative; }
.badge { width: 4.5rem; height: 4.5rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: 900; background: var(--card-muted); border: 4px solid var(--bg-card); font-size: 2rem; }
.gold-badge { width: 6.5rem; height: 6.5rem; font-size: 3.5rem; color: #eab308; background: #fffbeb; }
.silver-badge { color: #6b7280; }
.bronze-badge { color: #c2410c; }

.badge-icon { position: absolute; bottom: -0.25rem; right: -0.25rem; background: var(--bg-card); border-radius: 9999px; padding: .35rem; box-shadow: 0 2px 4px rgba(0,0,0,.1); }
.badge-icon svg { width: 1.25rem; height: 1.25rem; fill: currentColor; }
.podium-silver .badge-icon svg { color: #9ca3af; }
.podium-bronze .badge-icon svg { color: #fb923c; }
.gold-icon { bottom: -0.5rem; right: -0.5rem; padding: .65rem; }
.gold-icon svg { width: 2.25rem; height: 2.25rem; color: #facc15; }

.podium-footer { margin-top: auto; width: 100%; }
.score-box { border-radius: 1rem; padding: 0.875rem; width: 100%; background: var(--card-muted); text-align: center; }
.score-num { font-weight: 900; font-size: 2rem; color: var(--text-primary); line-height: 1; letter-spacing: -0.05em; }
.score-label { text-transform: uppercase; font-size: 0.65rem; font-weight: 800; color: var(--text-muted); display: block; margin-top: 0.25rem; letter-spacing: 0.1em; }
.gold-score { background: #fffbeb; border: 1px solid #fef08a; padding: 1.25rem; }
.gold-score .score-num { font-size: 3.25rem; color: #ca8a04; }

.participants-table-container { background: var(--bg-card); border-radius: 1.25rem; border: 1px solid var(--border-color); overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
.table-header-box { padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color); background: var(--card-muted); }
.participants-table { width: 100%; border-collapse: collapse; text-align: left; }
.participants-table th { padding: 1.25rem 2rem; font-size: .7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: .1em; border-bottom: 1px solid var(--border-color); }
.table-row-hover:hover {
  background: var(--card-muted);
  transform: scale(1.005) translateX(8px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.table-row-hover { border-bottom: 1px solid var(--border-color); transition: all 0.3s ease; position: relative; z-index: 1; }
.participants-table td { padding: 1.25rem 2rem; vertical-align: middle; }
.table-score-pill { display: inline-flex; align-items: center; padding: .5rem 1rem; border-radius: 1rem; background: var(--card-muted); color: var(--text-primary); font-size: .95rem; font-weight: 800; border: 1px solid var(--border-color); }

.spinner { width: 40px; height: 40px; border: 4px solid var(--card-muted); border-top-color: var(--indigo-500); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
