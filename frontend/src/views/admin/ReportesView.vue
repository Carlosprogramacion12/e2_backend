<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header with Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-top">
            <span class="stat-label">Total Usuarios</span>
            <div class="stat-icon indigo">
              <UsersIcon class="w-6 h-6" />
            </div>
          </div>
          <div class="stat-value">{{ stats.totalUsuarios || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-top">
            <span class="stat-label">Total Equipos</span>
            <div class="stat-icon blue">
              <Users2Icon class="w-6 h-6" />
            </div>
          </div>
          <div class="stat-value">{{ stats.totalEquipos || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-top">
            <span class="stat-label">Total Proyectos</span>
            <div class="stat-icon purple">
              <LayoutIcon class="w-6 h-6" />
            </div>
          </div>
          <div class="stat-value">{{ stats.totalProyectos || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-top">
            <span class="stat-label">Total Eventos</span>
            <div class="stat-icon emerald">
              <CalendarIcon class="w-6 h-6" />
            </div>
          </div>
          <div class="stat-value">{{ stats.totalEventos || 0 }}</div>
        </div>
      </div>

      <!-- Reports Section -->
      <div class="card">
        <div class="card-header">
          <span>Reportes PDF Generales</span>
        </div>
        <div class="card-body">
          <p class="text-sm text-gray-500 mb-4">Selecciona el tipo de reporte que deseas generar en formato PDF.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Usuarios -->
            <button @click="downloadPdf('usuarios')" class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
              <FileTextIcon class="w-10 h-10 text-gray-400 group-hover:text-indigo-500 mb-3" />
              <span class="font-bold text-gray-700">Reporte Usuarios</span>
              <span class="text-xs text-gray-400 mt-1">Lista completa de cuentas</span>
            </button>

            <!-- Equipos -->
            <button @click="downloadPdf('equipos')" class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group">
              <UsersIcon class="w-10 h-10 text-gray-400 group-hover:text-blue-500 mb-3" />
              <span class="font-bold text-gray-700">Reporte Equipos</span>
              <span class="text-xs text-gray-400 mt-1">Integración y proyectos</span>
            </button>

            <!-- Eventos -->
            <button @click="downloadPdf('eventos')" class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all group">
              <CalendarIcon class="w-10 h-10 text-gray-400 group-hover:text-emerald-500 mb-3" />
              <span class="font-bold text-gray-700">Reporte Eventos</span>
              <span class="text-xs text-gray-400 mt-1">Historial y criterios</span>
            </button>

            <!-- Proyectos -->
            <button @click="downloadPdf('proyectos')" class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all group">
              <LayoutIcon class="w-10 h-10 text-gray-400 group-hover:text-purple-500 mb-3" />
              <span class="font-bold text-gray-700">Reporte Proyectos</span>
              <span class="text-xs text-gray-400 mt-1">Estatus y calificaciones</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'
import { FileTextIcon, UsersIcon, Users2Icon, CalendarIcon, LayoutIcon } from 'lucide-vue-next'

const stats = ref({})
const loading = ref(true)

async function fetchStats() {
  try {
    const { data } = await api.get('/admin/reportes')
    stats.value = data.data
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}

async function downloadPdf(type) {
  try {
    const response = await api.get(`/admin/reportes/${type}/pdf`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Reporte_${type}_${new Date().toISOString().split('T')[0]}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    alert('Error al generar el reporte PDF')
  }
}

onMounted(fetchStats)
</script>

<style scoped>
.grid { display: grid; }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-700 { color: #374151; }
</style>
