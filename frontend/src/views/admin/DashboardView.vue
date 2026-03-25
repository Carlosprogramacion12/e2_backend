<template>
  <AppLayout>
    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <template v-else>
      <!-- Header Actions -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
        <h2 style="font-size:1.25rem;font-weight:600;color:#1f2937" class="dark-text">Dashboard</h2>
        <div style="display:flex;gap:0.75rem">
          <button @click="openCustomizer = true" class="btn btn-white dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
            <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
            Personalizar
          </button>
          <a :href="'/api/admin/dashboard/report'" target="_blank" class="btn btn-indigo">
            <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Generar Reporte PDF
          </a>
        </div>
      </div>

      <!-- Stats Cards (matching Laravel hover:scale-[1.02]) -->
      <div class="stats-grid">
        <!-- Total Usuarios -->
        <div class="stat-card">
          <div class="stat-top">
            <div>
              <p class="stat-label">Total Usuarios</p>
              <h4 class="stat-value">{{ (data.total_jueces || 0) + (data.total_participantes || 0) }}</h4>
            </div>
            <div class="stat-icon indigo">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </div>
          </div>
          <div class="stat-sub">
            <span class="green">{{ data.total_jueces || 0 }} Jueces</span>
            <span class="muted"> | {{ data.total_participantes || 0 }} Alumnos</span>
          </div>
        </div>
        <!-- Equipos Activos -->
        <div class="stat-card">
          <div class="stat-top">
            <div>
              <p class="stat-label">Equipos Activos</p>
              <h4 class="stat-value">{{ data.total_equipos || 0 }}</h4>
            </div>
            <div class="stat-icon blue">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
          </div>
          <div class="stat-sub"><span class="badge badge-blue" style="font-size:.8rem;padding:.25rem .75rem">Registrados</span></div>
        </div>
        <!-- Proyectos -->
        <div class="stat-card">
          <div class="stat-top">
            <div>
              <p class="stat-label">Proyectos</p>
              <h4 class="stat-value">{{ data.total_proyectos || 0 }}</h4>
            </div>
            <div class="stat-icon emerald">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
            </div>
          </div>
          <div class="stat-sub" style="display:flex;justify-content:space-between">
            <span class="green">{{ data.proyectosEvaluados || 0 }} Evaluados</span>
            <span class="muted">{{ data.proyectosPendientes || 0 }} Pendientes</span>
          </div>
        </div>
        <!-- Eventos Activos -->
        <div class="stat-card">
          <div class="stat-top">
            <div>
              <p class="stat-label">Eventos Activos</p>
              <h4 class="stat-value">{{ data.eventos_activos?.length || 0 }}</h4>
            </div>
            <div class="stat-icon purple">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
          </div>
          <div class="stat-sub"><span class="badge badge-purple" style="font-size:.8rem;padding:.25rem .75rem">En curso</span></div>
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-grid">
        <div class="card">
          <div class="card-header">Progreso de Evaluación</div>
          <div class="card-body" style="height:18rem;position:relative">
            <BarChart v-if="evalChartData" :data="evalChartData" :options="chartOptions" />
          </div>
        </div>
        <div class="card">
          <div class="card-header">Participación por Carrera</div>
          <div class="card-body" style="height:18rem;position:relative;display:flex;justify-content:center">
            <DoughnutChart v-if="carreraChartData" :data="carreraChartData" :options="doughnutOptions" />
          </div>
        </div>
      </div>

      <!-- Próximos Eventos -->
      <div class="card">
        <div class="card-header">
          Próximos Eventos
          <router-link to="/admin/eventos" style="font-size:.875rem;color:#4f46e5;text-decoration:none">Ver todo</router-link>
        </div>
        <div class="card-body">
          <div v-if="!data.eventos_activos?.length" class="empty-state"><p>No hay eventos programados.</p></div>
          <div v-else style="display:flex;flex-direction:column;gap:1rem">
            <div v-for="e in data.eventos_activos" :key="e.id" class="event-item">
              <div class="event-date-box">
                <span class="month">{{ getMonth(e.fecha_inicio) }}</span>
                <span class="day">{{ getDay(e.fecha_inicio) }}</span>
              </div>
              <div>
                <h4 style="font-size:.875rem;font-weight:700;color:#111827" class="dark-text">{{ e.nombre }}</h4>
                <p style="font-size:.75rem;color:#6b7280;margin-top:.25rem">{{ e.descripcion || '' }}</p>
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
import { Bar as BarChart, Doughnut as DoughnutChart } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const loading = ref(true)
const data = ref({})
const openCustomizer = ref(false)

const palette = ['#4f46e5','#ec4899','#10b981','#f59e0b','#3b82f6','#8b5cf6']

const evalChartData = computed(() => {
  if (data.value.proyectosEvaluados == null) return null
  return {
    labels: ['Evaluados', 'Pendientes'],
    datasets: [{ data: [data.value.proyectosEvaluados, data.value.proyectosPendientes], backgroundColor: ['#4f46e5','#94a3b8'], borderRadius: 4, barPercentage: .6 }]
  }
})

const carreraChartData = computed(() => {
  const pc = data.value.participantesPorCarrera
  if (!pc || !Object.keys(pc).length) return null
  return {
    labels: Object.keys(pc),
    datasets: [{ data: Object.values(pc), backgroundColor: palette, borderColor: '#fff', borderWidth: 2 }]
  }
})

const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#f1f5f9', borderDash: [4,4] } } } }
const doughnutOptions = { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { size: 11 } } } } }

function getMonth(d) { return d ? new Date(d).toLocaleDateString('es-MX',{month:'short'}).toUpperCase() : '' }
function getDay(d) { return d ? new Date(d).getDate() : '' }

onMounted(async () => {
  try { const res = await api.get('/admin/dashboard'); data.value = res.data.data }
  catch (e) { console.error(e) }
  finally { loading.value = false }
})
</script>
