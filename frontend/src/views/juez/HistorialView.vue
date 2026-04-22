<template>
  <AppLayout>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem">
      <div>
        <h2 style="font-size:1.5rem; font-weight:700; color:var(--text-primary); margin:0">Historial de Eventos</h2>
        <p style="font-size:0.875rem; color:var(--text-muted); margin-top:4px">Consulta los resultados y notas de eventos finalizados.</p>
      </div>
    </div>

    <div v-if="loading" style="display:flex; justify-content:center; padding:10rem">
      <div class="spinner"></div>
    </div>

    <template v-else>
      <div v-if="eventosPasados.length" class="eventos-grid">
        <div v-for="ev in eventosPasados" :key="ev.id" class="evento-card" style="border-color: #f1f5f9; box-shadow: 0 2px 4px -1px rgba(0,0,0,0.03); background: #fafafa">
          <div class="evento-card-body" style="padding: 1.25rem">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem">
              <div style="flex:1; min-width:0">
                <h4 style="font-size:1.1rem; font-weight:700; color:var(--text-primary); margin-bottom:.15rem">{{ ev.nombre }}</h4>
                <p style="font-size:.8rem; color:var(--text-muted); display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden">
                  {{ ev.descripcion || 'Sin descripción.' }}
                </p>
              </div>
            </div>

            <div style="margin-top:0.75rem">
              <div style="background: rgba(241, 245, 249, 0.5); border-radius: 0.5rem; border: 1px solid #eef2f6; padding: 0.6rem 1rem; display: flex; justify-content: space-between; align-items: center">
                 <div style="display:flex; align-items:center; gap:0.5rem">
                    <div style="background:#10b981; width:0.4rem; height:0.4rem; border-radius:99px"></div>
                    <span style="font-size:0.65rem; font-weight:800; color: #64748b; text-transform: uppercase; letter-spacing:0.03em">Concluido</span>
                 </div>
                 <div style="display:flex; align-items:baseline; gap:0.25rem">
                    <span style="font-size:0.85rem; font-weight:900; color:#1e293b">{{ getProgress(ev) }}%</span>
                    <span style="font-size:0.55rem; font-weight:700; color:#94a3b8; text-transform:uppercase">Score</span>
                 </div>
              </div>
            </div>
          </div>
          <div class="evento-card-footer" style="background:#fcfdfe; padding: 0.85rem 1.25rem">
            <div style="display:flex; align-items:center; font-size:.7rem; color:var(--text-muted); font-weight:600">
              <svg style="width:0.875rem; height:0.875rem; margin-right:.3rem; color:#cbd5e1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              {{ formatDate(ev.fecha_fin) }}
            </div>
            <router-link :to="`/juez/eventos/${ev.id}`" class="entrar-link" style="color: #4f46e5; font-size: 0.8rem" @click.stop>
              Ver Notas
              <svg style="width:0.875rem; height:0.875rem; margin-left:.2rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </router-link>
          </div>
        </div>
      </div>

      <div v-else class="empty-state-container">
        <div style="background:#fff; border:2px dashed #e2e8f0; border-radius:1.5rem; padding:5rem 2rem; text-align:center; max-width:500px; margin:2rem auto">
          <div style="background:#f8fafc; width:4rem; height:4rem; border-radius:1rem; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem">
            <svg style="width:2rem; height:2rem; color:#94a3b8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h3 style="font-size:1.1rem; font-weight:800; color:#1e293b; margin-bottom:0.5rem">Tu historial está vacío</h3>
          <p style="font-size:0.875rem; color:#64748b; line-height:1.6">Aún no tienes eventos finalizados registrados en el sistema. Los eventos aparecerán aquí automáticamente después de su fecha de cierre.</p>
          <router-link to="/juez/dashboard" class="btn-return">
            Volver a Sala de Evaluación
          </router-link>
        </div>
      </div>
    </template>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'

const eventos = ref([])
const loading = ref(true)

const eventosPasados = computed(() => {
  const now = new Date()
  return eventos.value.filter(ev => new Date(ev.fecha_fin) < now)
})

function getProgress(ev) {
  const total = ev.proyectos?.length || 0
  if (!total) return 0
  const evaluated = ev.proyectos.filter(p => p.evaluado).length
  return Math.round((evaluated / total) * 100)
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(async () => {
  try {
    const r = await api.get('/juez/dashboard')
    eventos.value = r.data.data.eventos || []
  } catch(e) { console.error(e) }
  finally { loading.value = false }
})
</script>

<style scoped>
.eventos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}
@media (max-width: 1024px) {
  .eventos-grid { grid-template-columns: 1fr; }
}

.evento-card {
  display: flex;
  flex-direction: column;
  background: var(--card-bg, #fff);
  border-radius: 1rem;
  border: 1px solid var(--border, #e5e7eb);
  overflow: hidden;
  transition: all .3s ease;
}
.evento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -5px rgba(0,0,0,0.1) !important;
}

.evento-card-body { padding: 1.5rem; flex: 1; }
.evento-card-footer {
  padding: 1.125rem 1.5rem;
  background: var(--card-muted, #f9fafb);
  border-top: 1px solid var(--border, #f3f4f6);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.entrar-link {
  display: inline-flex;
  align-items: center;
  font-size: .85rem;
  font-weight: 800;
  text-decoration: none;
  transition: all .2s;
}
.entrar-link:hover { transform: translateX(4px); }

.btn-return {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  color: #475569;
  font-weight: 800;
  font-size: 0.8rem;
  border-radius: 0.75rem;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-return:hover { background: #e2e8f0; color: #1e293b; }

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
