<template>
  <AppLayout>
    <div class="certificados-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Mis Certificados</h1>
          <p class="page-subtitle">Gestiona y visualiza tus reconocimientos oficiales por participación.</p>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <div v-else-if="eventos.length === 0" class="empty-state">
        <h3 class="empty-title">Sin participaciones registradas</h3>
        <p class="empty-text">Aún no tienes certificados disponibles. Los reconocimientos se habilitan al finalizar los eventos.</p>
      </div>

      <div v-else class="event-grid">
        <div v-for="item in eventos" :key="item.evento.id" class="event-mini-card">
          <div class="card-gradient-top"></div>
          
          <!-- Badge de Logro (Oro, Plata, Bronce) -->
          <div v-if="item.posicion" class="achievement-badge" :class="getRankClass(item.posicion)">
            <svg style="width:1rem;height:1rem" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            <span>{{ item.texto_logro }}</span>
          </div>
          
          <div class="card-status-badge" :class="isUnlocked(item.evento.fecha_fin) ? 'active' : 'pending'">
             <template v-if="isUnlocked(item.evento.fecha_fin)">
               <span>Disponible</span>
             </template>
             <template v-else>
               <svg style="width:0.75rem;height:0.75rem;margin-right:0.25rem" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
               <span>Bloqueado (En curso)</span>
             </template>
          </div>
          
          <div class="card-content">
            <h3 class="event-name">{{ item.evento.nombre }}</h3>
            <div class="event-date">
              <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span>{{ isUnlocked(item.evento.fecha_fin) ? 'Finalizó' : 'Finaliza' }} el {{ new Date(item.evento.fecha_fin).toLocaleDateString() }}</span>
            </div>

            <div class="download-actions">
              <button 
                @click="downloadCert('INDIVIDUAL', item.evento.id)" 
                class="btn-dl" 
                :disabled="!isUnlocked(item.evento.fecha_fin)"
                title="Ver Certificado Individual"
              >
                <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                <span>Individual</span>
              </button>
              
              <button 
                @click="downloadCert('EQUIPO', item.evento.id)" 
                class="btn-dl equipo" 
                :disabled="!isUnlocked(item.evento.fecha_fin)"
                title="Ver Certificado de Equipo"
              >
                <svg style="width:1.25rem;height:1.25rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                <span>Equipo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'
import alerts from '../../services/alerts'

const eventos = ref([])
const loading = ref(true)

function isUnlocked(fechaFin) {
  return new Date() >= new Date(fechaFin)
}

function getRankClass(pos) {
  if (pos === 1) return 'gold'
  if (pos === 2) return 'silver'
  if (pos === 3) return 'bronze'
  return 'participation'
}

async function fetchData() {
  try {
    const r = await api.get('/participante/constancias')
    eventos.value = r.data.data
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

async function downloadCert(tipo, eventoId) {
  try {
    const response = await api.get(`/participante/constancias/download/${tipo}/${eventoId}`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    // Abrir en nueva ventana/pestaña
    window.open(url, '_blank')
  } catch (e) {
    alerts.warning('Todavía no se ha generado el archivo o el acceso fue denegado.')
  }
}

onMounted(fetchData)
</script>

<style scoped>
.certificados-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.025em; }
.page-subtitle { color: var(--text-muted); margin-top: 0.5rem; font-size: 0.95rem; }

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.event-mini-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.event-mini-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: var(--indigo-400);
}

.card-status-badge {
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  z-index: 10;
}
.card-status-badge.active { background: #dcfce7; color: #15803d; }
.card-status-badge.pending { background: #fef3c7; color: #b45309; }

/* Achievement Badge */
.achievement-badge {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  padding: 0.3rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.achievement-badge.gold { background: linear-gradient(135deg, #fef9c3 0%, #facc15 100%); color: #854d0e; border: 1px solid #fde047; }
.achievement-badge.silver { background: linear-gradient(135deg, #f3f4f6 0%, #9ca3af 100%); color: #374151; border: 1px solid #d1d5db; }
.achievement-badge.bronze { background: linear-gradient(135deg, #ffedd5 0%, #d97706 100%); color: #78350f; border: 1px solid #fdba74; }
.achievement-badge.participation { background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; }

.card-gradient-top { height: 6px; background: linear-gradient(90deg, #4f46e5 0%, #ec4899 100%); width: 100%; }

.card-content {
  padding: 1.5rem;
  padding-top: 3.5rem;
}

.event-name {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.3;
  margin-bottom: 0.75rem;
}

.event-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
}

.download-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.btn-dl {
  padding: 0.8rem;
  border-radius: 1rem;
  background: var(--bg-main, #f9fafb);
  border: 1px solid var(--border, #e5e7eb);
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.btn-dl:hover:not(:disabled) {
  background: var(--indigo-600);
  border-color: var(--indigo-600);
  color: white;
  transform: translateY(-2px);
}

.btn-dl:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-dl svg { color: var(--indigo-500); transition: color 0.2s; }
.btn-dl:hover svg { color: white; }

.loading-state { display: flex; justify-content: center; padding: 5rem 0; }
.spinner { width: 3rem; height: 3rem; border: 4px solid #f3f4f6; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 5rem 2rem; background: var(--card-bg, #fff); border: 2px dashed #e5e7eb; border-radius: 2rem; margin-top: 2rem; }
.empty-title { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
.empty-text { color: var(--text-muted); margin-top: 0.75rem; font-size: 1rem; max-width: 300px; margin-left: auto; margin-right: auto; }

@media (max-width: 640px) {
  .certificados-page { padding: 1.5rem; }
  .download-actions { grid-template-columns: 1fr; }
}
</style>
