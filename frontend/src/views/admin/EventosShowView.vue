<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 style="font-size:1.5rem;font-weight:700">Detalles del Evento</h2>
      <router-link to="/admin/eventos" class="btn btn-outline btn-sm">
        <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Volver
      </router-link>
    </div>

    <div v-if="loading" style="padding:2rem;text-align:center;color:var(--text-muted)">Cargando detalles...</div>

    <div v-else-if="evento" style="display:grid;grid-template-columns:1fr 2fr;gap:2rem;align-items:start">
      <!-- Columna Izquierda: Información -->
      <div style="background:var(--card-bg,#fff);border:1px solid var(--border,#e5e7eb);border-radius:1rem;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
        <!-- Header Tarjeta -->
        <div style="padding:1.5rem;border-bottom:1px solid var(--border,#e5e7eb);background:#f9fafb">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem">
            <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary);line-height:1.2">{{ evento.nombre }}</h3>
            <!-- Badge de Estado -->
            <span :style="{ backgroundColor: getStatusColor(evento).bg, color: getStatusColor(evento).text, border: '1px solid ' + getStatusColor(evento).border }" style="display:inline-flex;align-items:center;padding:.125rem .625rem;border-radius:9999px;font-size:.75rem;font-weight:700">
              {{ getStatusLabel(evento) }}
            </span>
          </div>
          <p style="font-size:.75rem;color:var(--text-muted);font-family:monospace">ID: #{{ evento.id }}</p>
        </div>

        <!-- Cuerpo -->
        <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1.5rem">
          <div>
            <label style="display:block;font-size:.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.25rem">Descripción</label>
            <p style="font-size:.875rem;color:var(--text-primary);line-height:1.6">{{ evento.descripcion || 'Sin descripción detallada.' }}</p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
            <div style="background:#f9fafb;padding:.75rem;border-radius:.75rem;border:1px solid var(--border,#e5e7eb)">
              <span style="display:block;font-size:.75rem;color:#6366f1;font-weight:700;text-transform:uppercase;margin-bottom:.25rem">Inicia</span>
              <span style="display:block;font-size:.875rem;font-weight:700;color:var(--text-primary)">{{ fmtDate(evento.fecha_inicio) }}</span>
            </div>
            <div style="background:#f9fafb;padding:.75rem;border-radius:.75rem;border:1px solid var(--border,#e5e7eb)">
              <span style="display:block;font-size:.75rem;color:#ef4444;font-weight:700;text-transform:uppercase;margin-bottom:.25rem">Termina</span>
              <span style="display:block;font-size:.875rem;font-weight:700;color:var(--text-primary)">{{ fmtDate(evento.fecha_fin) }}</span>
            </div>
          </div>

          <div style="padding-top:.5rem">
            <router-link :to="'/admin/eventos/' + evento.id + '/editar'" class="btn btn-indigo" style="width:100%;justify-content:center;padding:.625rem;border-radius:.75rem;font-size:.875rem;box-shadow:0 4px 6px -1px rgba(79,70,229,.3)">
              <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Editar Información
            </router-link>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Criterios -->
      <div style="background:var(--card-bg,#fff);border:1px solid var(--border,#e5e7eb);border-radius:1rem;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
        <div style="padding:1.5rem;border-bottom:1px solid var(--border,#e5e7eb);display:flex;justify-content:space-between;align-items:center;background:#f9fafb">
          <div>
            <h3 style="font-size:1.125rem;font-weight:700;color:var(--text-primary)">Criterios de Evaluación</h3>
            <p style="font-size:.75rem;color:var(--text-muted)">Define la rúbrica para los jueces.</p>
          </div>
          <button @click="showCriterioForm = !showCriterioForm" class="btn btn-indigo btn-sm" style="text-transform:uppercase;font-size:.75rem;font-weight:700;padding:.5rem 1rem">
            {{ showCriterioForm ? 'Cancelar' : '+ Agregar Criterio' }}
          </button>
        </div>

        <div style="padding:1.5rem">
          <!-- Formulario Nuevo Criterio -->
          <div v-if="showCriterioForm" style="margin-bottom:2rem;background:#eef2ff;padding:1.25rem;border-radius:1rem;border:1px solid #c7d2fe;position:relative">
            <h4 style="font-size:.875rem;font-weight:700;color:#3730a3;margin-bottom:1rem;text-transform:uppercase;letter-spacing:.05em">Nuevo Criterio</h4>
            <div style="display:flex;gap:1rem;align-items:flex-end">
              <div style="flex:1">
                <label style="display:block;font-size:.75rem;font-weight:700;color:#6b7280;margin-bottom:.25rem">Nombre</label>
                <input type="text" placeholder="Ej. Innovación, Diseño..." style="width:100%;padding:.5rem .75rem;border-radius:.5rem;border:1px solid #d1d5db;font-size:.875rem">
              </div>
              <div style="width:8rem">
                <label style="display:block;font-size:.75rem;font-weight:700;color:#6b7280;margin-bottom:.25rem">Peso (%)</label>
                <input type="number" placeholder="Máx 100" style="width:100%;padding:.5rem .75rem;border-radius:.5rem;border:1px solid #d1d5db;font-size:.875rem">
              </div>
              <button class="btn btn-indigo" style="padding:.5rem 1.5rem;border-radius:.5rem;font-size:.875rem" @click.prevent="alert('Funcionalidad de criterios pendiente')">Guardar</button>
            </div>
          </div>

          <!-- Resumen (Donut / Stats) -->
          <div style="display:flex;gap:2rem;margin-bottom:2rem;align-items:center;justify-content:center;padding:1rem;background:#f9fafb;border-radius:1rem;border:1px solid var(--border,#e5e7eb)">
            <div style="position:relative;width:6rem;height:6rem">
              <svg style="width:100%;height:100%;transform:rotate(-90deg)">
                <circle cx="48" cy="48" r="40" stroke="currentColor" stroke-width="8" fill="transparent" style="color:#e5e7eb"></circle>
                <circle cx="48" cy="48" r="40" stroke="currentColor" stroke-width="8" fill="transparent" stroke-dasharray="251.2" stroke-dashoffset="251.2" style="color:#22c55e;transition:stroke-dashoffset 1s"></circle>
              </svg>
              <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:var(--text-secondary)">0%</div>
            </div>
            <div>
              <h4 style="font-size:.875rem;font-weight:700;color:var(--text-primary)">Estado de la Rúbrica</h4>
              <p style="font-size:.75rem;color:var(--text-muted);margin-top:.25rem">
                <span style="color:#ca8a04;font-weight:700">Incompleta.</span> Tienes un <span style="font-weight:700">100% disponible</span> para asignar.
              </p>
            </div>
          </div>

          <!-- Empty State -->
          <div style="text-align:center;padding:3rem 0;border:2px dashed var(--border,#e5e7eb);border-radius:1rem">
            <div style="background:#f3f4f6;padding:.75rem;border-radius:50%;width:3rem;height:3rem;display:flex;align-items:center;justify-content:center;margin:0 auto .75rem">
              <svg style="width:1.5rem;height:1.5rem;color:#9ca3af" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h3 style="color:var(--text-primary);font-weight:700;font-size:.875rem">Sin Criterios</h3>
            <p style="color:var(--text-muted);font-size:.75rem;margin-top:.25rem">Este evento aún no tiene reglas de evaluación.</p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'

const route = useRoute()
const evento = ref(null)
const loading = ref(true)
const showCriterioForm = ref(false)

const getStatusLabel = (e) => {
  const now = new Date()
  const start = new Date(e.fecha_inicio)
  const end = new Date(e.fecha_fin)
  if (now >= start && now <= end) return 'En Curso'
  if (now < start) return 'Próximo'
  return 'Finalizado'
}

const getStatusColor = (e) => {
  const lbl = getStatusLabel(e)
  if (lbl === 'En Curso') return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' } // Green
  if (lbl === 'Próximo') return { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' } // Indigo
  return { bg: '#f3f4f6', text: '#1f2937', border: '#e5e7eb' } // Gray
}

const fmtDate = (dString) => {
  if (!dString) return '-'
  const d = new Date(dString)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  try {
    const res = await api.get(`/admin/eventos/${route.params.id}`)
    evento.value = res.data.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
