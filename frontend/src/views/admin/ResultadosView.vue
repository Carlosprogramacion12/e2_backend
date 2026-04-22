<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary)">Resultados y Ganadores</h2>
    </div>

    <!-- Filtro de evento -->
    <div class="card-box md-flex-row md-justify-between md-align-center" style="display:flex;flex-direction:column;gap:1rem;margin-bottom:3rem;position:relative;z-index:20">
      <div style="display:flex;align-items:center;gap:.75rem">
        <div style="padding:.5rem;background:#e0e7ff;color:#4f46e5;border-radius:.5rem">
          <svg style="width:1.5rem;height:1.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <div>
          <h3 style="font-size:.875rem;font-weight:700;color:var(--text-primary);margin:0">Seleccionar Evento</h3>
          <p style="font-size:.75rem;color:#6b7280;margin:0">Visualiza el ranking por competencia</p>
        </div>
      </div>

      <div class="md-w-auto" style="width:100%;">
        <div style="position:relative">
          <select v-model="eventoSeleccionado" @change="fetchData" class="custom-select md-w-64">
            <option v-for="ev in eventos" :key="ev.id" :value="ev.id">
              {{ ev.nombre }}
            </option>
          </select>
          <div style="position:absolute;top:0;bottom:0;right:0;display:flex;align-items:center;padding:0 .5rem;pointer-events:none;color:#6b7280">
            <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Spinner -->
    <div v-if="loading" style="padding:4rem;text-align:center"><div class="spinner">Cargando...</div></div>

    <!-- Sin Resultados -->
    <div v-else-if="ranking.length === 0" class="empty-state">
      <div style="background:#f3f4f6;padding:1rem;border-radius:9999px;margin-bottom:1rem">
        <svg style="width:2.5rem;height:2.5rem;color:#9ca3af" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary);margin:0">Sin Resultados</h3>
      <p style="font-size:.875rem;color:#6b7280;text-align:center;max-width:24rem;margin:.25rem 0 0">Aún no hay calificaciones suficientes para generar el ranking de este evento.</p>
    </div>

    <!-- Podio y Tabla -->
    <div v-else>
      
      <!-- 2. PODIO DE GANADORES (TOP 3) -->
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
              <button @click="btnDescargar(ranking[1], 2)" class="download-btn silver-btn" title="Descargar Constancia">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
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
              <button @click="btnDescargar(ranking[0], 1)" class="download-btn gold-btn" title="Descargar Constancia de Ganador">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
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
              <button @click="btnDescargar(ranking[2], 3)" class="download-btn bronze-btn" title="Descargar Constancia">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. TABLA DE POSICIONES -->
      <div v-if="ranking.length > 0" class="participants-table-container" style="margin-top: 3rem;">
        <div class="table-header-box">
          <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary);margin:0">Tabla de Posiciones</h3>
        </div>
        <div style="overflow-x:auto">
          <table class="participants-table">
            <thead>
              <tr>
                <th style="width:5rem;text-align:center">Posición</th>
                <th>Proyecto / Equipo</th>
                <th style="text-align:center">Puntaje</th>
                <th style="text-align:right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in ranking" :key="item.id" class="table-row-hover">
                <td style="text-align:center;font-weight:700;color:#9ca3af;font-size:1.125rem">
                  {{ idx + 1 }}
                </td>
                <td>
                  <p style="font-weight:700;color:var(--text-primary);font-size:.875rem;margin:0 0 .25rem">{{ item.nombre }}</p>
                  <p style="font-size:.75rem;color:#6b7280;margin:0">{{ item.equipo }}</p>
                </td>
                <td style="text-align:center">
                  <span class="table-score-pill">
                    {{ formatNumber(item.puntaje) }}
                  </span>
                </td>
                <td style="text-align:right">
                  <button @click="btnDescargar(item, idx + 1)" class="table-download-btn">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Constancia
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Componente oculto para generar el PDF -->
    <ConstanciaTemplate 
        ref="constanciaRef" 
        :proyecto="constanciaData" 
        :posicion="constanciaPosicion" 
        :eventoNombre="eventoNombreActual" />

  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import ConstanciaTemplate from '../../components/ConstanciaTemplate.vue'
import api from '../../plugins/axios'

const eventos = ref([])
const eventoSeleccionado = ref(null)
const ranking = ref([])
const loading = ref(true)

// Constancia Refs
const constanciaRef = ref(null)
const constanciaData = ref(null)
const constanciaPosicion = ref(1)

const eventoNombreActual = computed(() => {
  const ev = eventos.value.find(e => e.id === Number(eventoSeleccionado.value))
  return ev ? ev.nombre : 'Evento'
})

onMounted(async () => {
  await fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    let url = '/admin/resultados'
    if (eventoSeleccionado.value) {
      url += `?evento_id=${eventoSeleccionado.value}`
    }
    const { data } = await api.get(url)
    
    eventos.value = data.data.eventos
    
    // Si no había nada seleccionado, setteamos el último
    if (!eventoSeleccionado.value && data.data.evento) {
      eventoSeleccionado.value = data.data.evento.id
    }
    
    ranking.value = data.data.ranking || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function formatNumber(num) {
  return Number(num).toFixed(1)
}

// Lanza la generación de PDF
async function btnDescargar(proyecto, posicion) {
  constanciaData.value = proyecto
  constanciaPosicion.value = posicion
  
  // Wait for Vue to update the DOM on the hidden component
  await nextTick()
  if (constanciaRef.value) {
    constanciaRef.value.descargarPDF()
  }
}
</script>

<style scoped>
/* Reset and utilities */
* { box-sizing: border-box; }
.card-box { background: var(--card-bg, #fff); padding: 1rem; border-radius: 1rem; box-shadow: 0 1px 2px rgba(0,0,0,.05); border: 1px solid var(--border, #e5e7eb); }
.custom-select { width: 100%; padding: .625rem 2.5rem .625rem 1rem; background: var(--bg-main, #f9fafb); border: 1px solid var(--border, #e5e7eb); border-radius: .75rem; font-size: .875rem; color: var(--text-primary); cursor: pointer; appearance: none; box-shadow: 0 1px 2px rgba(0,0,0,.05); transition: border-color 0.2s; }
.custom-select:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79,70,229,.2); }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 0; background: var(--card-bg, #fff); border-radius: 1rem; border: 2px dashed var(--border, #e5e7eb); }

/* GRID LAYOUT FOR PODIUM */
.podium-grid {
  display: grid;
  gap: 1.5rem;
  align-items: flex-end;
  margin-bottom: 4rem;
  position: relative;
  z-index: 10;
  padding: 0 1rem;
}
@media (min-width: 768px) {
  .podium-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); padding: 0; }
  .md-flex-row { flex-direction: row !important; }
  .md-justify-between { justify-content: space-between !important; }
  .md-align-center { align-items: center !important; }
  .md-w-auto { width: auto !important; }
  .md-w-64 { width: 16rem !important; }
  .podium-silver { order: 1; }
  .podium-gold { order: 2; margin-top: -5rem; }
  .podium-bronze { order: 3; }
}

/* PODIUM INDIVIDUAL ITEMS */
.podium-item { position: relative; height: 100%; transition: transform 0.3s ease; }
.podium-glow { position: absolute; inset: 0; border-radius: 1.5rem; filter: blur(24px); opacity: 0.3; transition: opacity 0.5s; }
.podium-item:hover .podium-glow { opacity: 0.6; }

.podium-card {
  position: relative;
  background: var(--card-bg, #fff);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,.1), 0 10px 10px -5px rgba(0,0,0,.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.podium-item:hover .podium-card { transform: translateY(-0.5rem); box-shadow: 0 25px 50px -12px rgba(0,0,0,.15); }

/* GOLD ITEM SPECIFICS */
.podium-gold { z-index: 20; transform: scale(1.05); }
.gold-glow { filter: blur(32px); opacity: 0.4; animation: pulse-slow 3s infinite alternate; background: linear-gradient(to bottom, #fde047, #eab308, #ca8a04); }
.podium-gold .podium-card { padding: 2rem; border-top: 4px solid #facc15; }
.podium-gold:hover .podium-card { transform: translateY(-0.75rem); }

/* SILVER AND BRONZE BORDERS */
.silver-card { border-top: 4px solid #9ca3af; }
.silver-glow { background: linear-gradient(to bottom, #e5e7eb, #d1d5db, #9ca3af); }

.bronze-card { border-top: 4px solid #fb923c; }
.bronze-glow { background: linear-gradient(to bottom, #fed7aa, #fdba74, #fb923c); }

/* TYPOGRAPHY */
.podium-name { font-size: 1.125rem; font-weight: 700; color: var(--text-primary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0 0 .25rem; line-height: 1.25; }
.podium-team { font-size: .75rem; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; font-weight: 700; margin: 0 0 1.5rem; }
.gold-name { font-size: 1.5rem; font-weight: 800; }
.gold-team { color: #ca8a04; letter-spacing: .1em; margin-bottom: 2rem; font-size: .875rem; }

/* BADGES (1, 2, 3 circles) */
.badge-wrapper { margin-bottom: 1.25rem; position: relative; }
.podium-gold .badge-wrapper { margin-bottom: 1.5rem; }

.badge { 
  border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: 900; 
  box-shadow: inset 0 2px 4px rgba(0,0,0,.06); border: 4px solid var(--card-bg, #fff); transition: transform 0.5s ease;
}
.silver-badge, .bronze-badge { width: 4rem; height: 4rem; font-size: 1.875rem; background: #f3f4f6; }
.silver-badge { color: #9ca3af; }
.bronze-badge { color: #fb923c; }
.gold-badge { width: 6rem; height: 6rem; font-size: 3rem; background: linear-gradient(to bottom right, #fefce8, #fef9c3); color: #eab308; }

.podium-item:hover .silver-badge, .podium-item:hover .bronze-badge { transform: scale(1.1); }
.podium-item:hover .gold-badge { transform: scale(1.1) rotate(12deg); }

/* LITTLE STARS / ICON BADGES */
.badge-icon { position: absolute; bottom: -0.25rem; right: -0.25rem; background: var(--card-bg, #fff); border-radius: 9999px; padding: .25rem; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
.badge-icon svg { width: 1.25rem; height: 1.25rem; fill: currentColor; }
.podium-silver .badge-icon svg { color: #9ca3af; }
.podium-bronze .badge-icon svg { color: #fb923c; }
.gold-icon { bottom: -0.5rem; right: -0.5rem; padding: .5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,.1); }
.gold-icon svg { width: 2rem; height: 2rem; color: #facc15; animation: bounce 1.5s infinite; }

/* SCORE BOXES */
.podium-footer { margin-top: auto; width: 100%; display: flex; flex-direction: column; align-items: center; }
.score-box { border-radius: 1rem; margin-bottom: 1.5rem; width: 100%; }
.score-num { font-weight: 900; letter-spacing: -0.025em; line-height: 1; }
.score-label { text-transform: uppercase; font-weight: 700; display: block; margin-top: -.25rem; }

.silver-score, .bronze-score { background: rgba(243,244,246,0.5); padding: .75rem 1rem; border: 1px solid var(--border, #f3f4f6); }
.silver-score .score-num { font-size: 1.875rem; color: #4b5563; }
.bronze-score .score-num { font-size: 1.875rem; color: #ea580c; }
.silver-score .score-label, .bronze-score .score-label { font-size: .625rem; color: #9ca3af; }

.gold-score { background: rgba(254,252,232,0.5); padding: 1rem 1.5rem; border: 1px solid rgba(254,240,138,0.5); margin-bottom: 2rem; }
.gold-score .score-num { font-size: 3rem; color: #ca8a04; }
.gold-score .score-label { font-size: .75rem; color: rgba(202,138,4,0.7); }

/* DOWNLOAD BUTTONS */
.download-btn { display: inline-flex; align-items: center; justify-content: center; border-radius: 9999px; transition: all 0.3s; border: none; cursor: pointer; }
.download-btn svg { width: 1.5rem; height: 1.5rem; }
.download-btn:hover { transform: scale(1.1); box-shadow: 0 15px 20px -3px rgba(0,0,0,.15); }

.silver-btn { width: 3rem; height: 3rem; background: #f3f4f6; color: #4b5563; box-shadow: 0 10px 15px -3px rgba(0,0,0,.1); }
.silver-btn:hover { background: #e5e7eb; }

.bronze-btn { width: 3rem; height: 3rem; background: #ffedd5; color: #ea580c; box-shadow: 0 10px 15px -3px rgba(0,0,0,.1); }
.bronze-btn:hover { background: #fed7aa; }

.gold-btn { width: 4rem; height: 4rem; border: 4px solid var(--card-bg, #fff); background: linear-gradient(to right, #facc15, #eab308); color: white; box-shadow: 0 10px 15px -3px rgba(0,0,0,.1); }
.gold-btn svg { width: 2rem; height: 2rem; }
.gold-btn:hover { background: linear-gradient(to right, #eab308, #ca8a04); }

/* TABLE REGION */
.participants-table-container { background: var(--card-bg, #fff); border-radius: 1rem; box-shadow: 0 1px 2px rgba(0,0,0,.05); border: 1px solid var(--border, #e5e7eb); overflow: hidden; }
.table-header-box { padding: 1.5rem; border-bottom: 1px solid var(--border, #f3f4f6); background: rgba(249,250,251,0.5); }
.participants-table { width: 100%; border-collapse: collapse; text-align: left; }
.participants-table thead { background: rgba(249,250,251,0.5); }
.participants-table th { padding: 1rem 1.5rem; font-size: .75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; }
.participants-table tbody { border-top: 1px solid var(--border, #f3f4f6); }
.table-row-hover:hover { background: #f9fafb; transition: background 0.2s; }
.table-row-hover { border-bottom: 1px solid var(--border, #f3f4f6); }
.table-score-pill { display: inline-flex; align-items: center; padding: .25rem .75rem; border-radius: 9999px; background: #f3f4f6; color: var(--text-primary); font-size: .875rem; font-weight: 700; }
.table-download-btn { font-size: .75rem; color: #4f46e5; font-weight: 700; display: inline-flex; align-items: center; gap: .25rem; background: none; border: none; cursor: pointer; text-decoration: none; padding: .25rem .5rem; border-radius: .5rem; transition: all 0.2s; }
.dark .table-download-btn { color: #818cf8; }
.table-download-btn svg { width: 1.125rem; height: 1.125rem; }
.table-download-btn:hover { color: #3730a3; text-decoration: underline; }
.dark .table-download-btn:hover { color: #a5b4fc; }

/* ANIMATIONS */
@keyframes pulse-slow {
  0% { transform: scale(0.95); opacity: 0.4; }
  100% { transform: scale(1.05); opacity: 0.7; }
}
@keyframes bounce {
  0%, 100% { transform: translateY(-20%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}
</style>
