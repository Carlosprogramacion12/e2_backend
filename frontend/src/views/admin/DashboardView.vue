<template>
  <AppLayout>
    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <template v-else>
      <!-- Header Actions -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
        <h2 style="font-size:1.25rem;font-weight:600;color:var(--text-primary)">Dashboard</h2>
        <div style="display:flex;gap:0.75rem">
          <button @click="showCustomizer = !showCustomizer" class="btn btn-white">
            <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            Personalizar
          </button>
          <a :href="apiBase + '/admin/dashboard/report'" target="_blank" class="btn btn-indigo">
            <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Generar Reporte PDF
          </a>
        </div>
      </div>

      <!-- Customizer Panel -->
      <div v-if="showCustomizer" class="customizer-panel">
        <div class="customizer-header">
          <h3>Configuración del Tablero</h3>
          <p style="font-size:.75rem;color:var(--text-muted);margin-top:.25rem">Muestra u oculta widgets y cambia tipos de gráficos.</p>
        </div>
        <div class="customizer-body">
          <h4 class="customizer-section-title">Tarjetas de Resumen</h4>
          <div v-for="w in widgets.filter(ww => ww.key.startsWith('stats_'))" :key="w.key" class="customizer-item">
            <label><input type="checkbox" v-model="w.is_visible"> {{ widgetLabel(w.key) }}</label>
          </div>
          <h4 class="customizer-section-title" style="margin-top:1rem">Gráficos y Listas</h4>
          <div v-for="w in widgets.filter(ww => !ww.key.startsWith('stats_'))" :key="w.key" class="customizer-item">
            <label><input type="checkbox" v-model="w.is_visible"> {{ widgetLabel(w.key) }}</label>
            <select v-if="w.key.startsWith('chart_')" v-model="w.settings.type" class="customizer-select">
              <option value="bar">Barras (Vertical)</option>
              <option value="horizontalBar">Barras (Horizontal)</option>
              <option value="doughnut">Dona</option>
              <option value="line">Línea</option>
              <option value="pie">Pastel</option>
            </select>
          </div>
        </div>
        <div class="customizer-footer">
          <button @click="savePreferences" class="btn btn-indigo" style="width:100%">Aplicar Cambios</button>
        </div>
      </div>

      <!-- Stats Cards Grid -->
      <div class="stats-grid">
        <div v-if="isVisible('stats_users')" class="stat-card">
          <div class="stat-top">
            <div><p class="stat-label">Total Usuarios</p><h4 class="stat-value">{{ (data.total_jueces || 0) + (data.total_participantes || 0) }}</h4></div>
            <div class="stat-icon indigo"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg></div>
          </div>
          <div class="stat-sub"><span class="green">{{ data.total_jueces || 0 }} Jueces</span><span class="muted"> | {{ data.total_participantes || 0 }} Alumnos</span></div>
        </div>
        <div v-if="isVisible('stats_equipos')" class="stat-card">
          <div class="stat-top">
            <div><p class="stat-label">Equipos Activos</p><h4 class="stat-value">{{ data.total_equipos || 0 }}</h4></div>
            <div class="stat-icon blue"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg></div>
          </div>
          <div class="stat-sub"><span class="badge badge-blue">Registrados</span></div>
        </div>
        <div v-if="isVisible('stats_proyectos')" class="stat-card">
          <div class="stat-top">
            <div><p class="stat-label">Proyectos</p><h4 class="stat-value">{{ data.total_proyectos || 0 }}</h4></div>
            <div class="stat-icon emerald"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg></div>
          </div>
          <div class="stat-sub" style="display:flex;justify-content:space-between"><span class="green">{{ data.proyectosEvaluados || 0 }} Evaluados</span><span class="muted">{{ data.proyectosPendientes || 0 }} Pendientes</span></div>
        </div>
        <div v-if="isVisible('stats_eventos')" class="stat-card">
          <div class="stat-top">
            <div><p class="stat-label">Eventos Activos</p><h4 class="stat-value">{{ data.eventos_activos?.length || 0 }}</h4></div>
            <div class="stat-icon purple"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
          </div>
          <div class="stat-sub"><span class="badge badge-purple">En curso</span></div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <!-- Evaluación Chart -->
        <div v-if="isVisible('chart_evaluacion')" class="card">
          <div class="card-header">Progreso de Evaluación</div>
          <div class="card-body" style="height:18rem;position:relative">
            <component :is="getChartComponent('chart_evaluacion')" v-if="evalChartData" :data="evalChartData" :options="getChartOptions('chart_evaluacion')" />
          </div>
        </div>
        <!-- Carreras Chart -->
        <div v-if="isVisible('chart_carreras')" class="card">
          <div class="card-header">Participación por Carrera</div>
          <div class="card-body" style="height:18rem;position:relative;display:flex;justify-content:center">
            <component :is="getChartComponent('chart_carreras')" v-if="carreraChartData" :data="carreraChartData" :options="getChartOptions('chart_carreras')" />
            <div v-else style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:.875rem">Sin datos de carreras</div>
          </div>
        </div>
        <!-- Pendientes Anual Chart -->
        <div v-if="isVisible('chart_pendientes_anual')" class="card">
          <div class="card-header">Proyectos Pendientes (Anual)</div>
          <div class="card-body" style="height:18rem;position:relative">
            <component :is="getChartComponent('chart_pendientes_anual')" v-if="pendientesChartData" :data="pendientesChartData" :options="getChartOptions('chart_pendientes_anual')" />
          </div>
        </div>
        <!-- Categorías Chart -->
        <div v-if="isVisible('chart_categorias')" class="card">
          <div class="card-header">Proyectos por Categoría</div>
          <div class="card-body" style="height:18rem;position:relative;display:flex;justify-content:center">
            <component :is="getChartComponent('chart_categorias')" v-if="categoriasChartData" :data="categoriasChartData" :options="getChartOptions('chart_categorias')" />
            <div v-else style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:.875rem">Sin datos</div>
          </div>
        </div>
      </div>

      <!-- Próximos Eventos List -->
      <div v-if="isVisible('list_eventos')" class="card" style="margin-top:1.5rem">
        <div class="card-header">
          <span>Próximos Eventos</span>
          <router-link to="/admin/eventos" style="font-size:.875rem;color:#4f46e5;text-decoration:none;font-weight:600">Ver todo</router-link>
        </div>
        <div class="card-body">
          <div v-if="!data.eventos_activos?.length" class="empty-state"><p>No hay eventos programados.</p></div>
          <div v-else style="display:flex;flex-direction:column;gap:1rem">
            <div v-for="e in data.eventos_activos" :key="e.id" class="event-item">
              <div class="event-date-box">
                <span class="month">{{ getMonth(e.fecha_inicio) }}</span>
                <span class="day">{{ getDay(e.fecha_inicio) }}</span>
              </div>
              <div style="flex:1;min-width:0">
                <h4 style="font-size:.875rem;font-weight:700;color:var(--text-primary)">{{ e.nombre }}</h4>
                <p style="font-size:.75rem;color:var(--text-muted);margin-top:.25rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ e.descripcion || '' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Bar as BarChart, Doughnut as DoughnutChart, Line as LineChart, Pie as PieChart } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const apiBase = import.meta.env.VITE_API_URL || '/api'

const loading = ref(true)
const data = ref({})
const widgets = ref([])
const showCustomizer = ref(false)

const palette = ['#4f46e5','#ec4899','#10b981','#f59e0b','#3b82f6','#8b5cf6']

function isVisible(key) {
  const w = widgets.value.find(ww => ww.key === key)
  return w ? w.is_visible : true
}

function getWidgetSettings(key) {
  const w = widgets.value.find(ww => ww.key === key)
  return w?.settings || {}
}

function widgetLabel(key) {
  const labels = {
    stats_users: 'Total Usuarios', stats_equipos: 'Equipos Activos', stats_proyectos: 'Proyectos', stats_eventos: 'Eventos Activos',
    chart_evaluacion: 'Progreso de Evaluación', chart_carreras: 'Participación por Carrera',
    chart_pendientes_anual: 'Proyectos Pendientes (Anual)', chart_categorias: 'Proyectos por Categoría',
    list_eventos: 'Próximos Eventos'
  }
  return labels[key] || key
}

function getChartComponent(key) {
  const type = getWidgetSettings(key).type || 'bar'
  if (type === 'doughnut') return DoughnutChart
  if (type === 'pie') return PieChart
  if (type === 'line') return LineChart
  return BarChart
}

function getChartOptions(key) {
  const type = getWidgetSettings(key).type || 'bar'
  const isRound = type === 'doughnut' || type === 'pie'
  const isHorizontal = type === 'horizontalBar'

  const base = {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 1500, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: isRound, position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { size: 11 } } },
      tooltip: { padding: 10, usePointStyle: true }
    },
    layout: { padding: 10 }
  }

  if (!isRound) {
    base.indexAxis = isHorizontal ? 'y' : 'x'
    base.scales = {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#f1f5f9', borderDash: [4,4] } }
    }
  }

  if (type === 'doughnut') base.cutout = '70%'
  return base
}

// Chart data computeds
const evalChartData = computed(() => {
  if (data.value.proyectosEvaluados == null) return null
  return {
    labels: ['Evaluados', 'Pendientes'],
    datasets: [{ label: 'Proyectos', data: [data.value.proyectosEvaluados, data.value.proyectosPendientes], backgroundColor: ['#4f46e5','#94a3b8'], borderRadius: 4, barPercentage: .6 }]
  }
})

const carreraChartData = computed(() => {
  const pc = data.value.participantesPorCarrera
  if (!pc || !Object.keys(pc).length) return null
  return {
    labels: Object.keys(pc),
    datasets: [{ label: 'Participantes', data: Object.values(pc), backgroundColor: palette, borderColor: '#fff', borderWidth: 2 }]
  }
})

const pendientesChartData = computed(() => {
  const pa = data.value.pendientesAnual
  if (!pa || !Object.keys(pa).length) return null
  const type = getWidgetSettings('chart_pendientes_anual').type || 'line'
  const isLine = type === 'line'
  return {
    labels: Object.keys(pa),
    datasets: [{
      label: 'Pendientes',
      data: Object.values(pa),
      backgroundColor: isLine ? 'rgba(245,158,11,0.2)' : palette.slice(0, Object.keys(pa).length),
      borderColor: isLine ? '#f59e0b' : palette.slice(0, Object.keys(pa).length),
      borderWidth: isLine ? 3 : 0,
      pointBackgroundColor: '#fff', pointBorderColor: '#f59e0b', pointBorderWidth: 2,
      pointRadius: 5, pointHoverRadius: 7,
      fill: isLine, tension: 0.4, borderRadius: 4
    }]
  }
})

const categoriasChartData = computed(() => {
  const cd = data.value.categoriasData
  if (!cd || !Object.keys(cd).length) return null
  return {
    labels: Object.keys(cd),
    datasets: [{ label: 'Proyectos', data: Object.values(cd), backgroundColor: palette, borderWidth: 2, borderRadius: 4, barPercentage: .6 }]
  }
})

function getMonth(d) { return d ? new Date(d).toLocaleDateString('es-MX',{month:'short'}).toUpperCase() : '' }
function getDay(d) { return d ? new Date(d).getDate() : '' }

async function savePreferences() {
  try {
    await api.post('/admin/dashboard/preferences', { widgets: widgets.value })
    showCustomizer.value = false
  } catch (e) { console.error(e) }
}

onMounted(async () => {
  try {
    const res = await api.get('/admin/dashboard')
    data.value = res.data.data
    widgets.value = res.data.data.widgets || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})
</script>

<style scoped>
.customizer-panel { background: var(--card-bg, #fff); border: 1px solid var(--border, #e5e7eb); border-radius: .75rem; margin-bottom: 1.5rem; overflow: hidden; box-shadow: 0 4px 25px rgba(0,0,0,.08); }
.customizer-header { padding: 1rem 1.25rem; background: var(--card-muted, #f9fafb); border-bottom: 1px solid var(--border, #e5e7eb); }
.customizer-header h3 { font-size: .875rem; font-weight: 700; color: var(--text-primary); }
.customizer-body { padding: 1rem 1.25rem; max-height: 400px; overflow-y: auto; }
.customizer-section-title { font-size: .7rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: .05em; margin-bottom: .5rem; }
.customizer-item { display: flex; align-items: center; justify-content: space-between; padding: .5rem .75rem; border-radius: .5rem; margin-bottom: .25rem; }
.customizer-item:hover { background: var(--card-muted, #f9fafb); }
.customizer-item label { display: flex; align-items: center; gap: .5rem; font-size: .875rem; color: var(--text-secondary); cursor: pointer; }
.customizer-item input[type="checkbox"] { accent-color: #4f46e5; width: 1rem; height: 1rem; }
.customizer-select { padding: .25rem .5rem; font-size: .75rem; border: 1px solid var(--border, #e5e7eb); border-radius: .375rem; background: var(--card-bg, #fff); color: var(--text-secondary); }
.customizer-footer { padding: 1rem 1.25rem; background: var(--card-muted, #f9fafb); border-top: 1px solid var(--border, #e5e7eb); }

.charts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-top: 1.5rem; }
@media (max-width: 768px) { .charts-grid { grid-template-columns: 1fr; } }
</style>
