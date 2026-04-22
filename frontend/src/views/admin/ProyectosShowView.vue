<template>
  <AppLayout>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <h2 style="font-size:1.5rem;font-weight:700;color:var(--text-primary)">Detalle de Evaluación</h2>
      <router-link to="/admin/proyectos" class="btn btn-white hover:bg-gray-50 text-gray-700" style="padding:.5rem 1rem;border-radius:.5rem;font-size:.75rem;font-weight:700;text-transform:uppercase;display:inline-flex;align-items:center;box-shadow:0 1px 2px rgba(0,0,0,0.05);text-decoration:none">
        <svg style="width:1rem;height:1rem;margin-right:.5rem" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Volver
      </router-link>
    </div>

    <div v-if="loading" style="padding:4rem;text-align:center"><div class="spinner"></div></div>
    
    <div v-else-if="proyecto" style="background:var(--bg-main,#f9fafb);min-height:100vh">
      <div style="display:grid;grid-template-columns:repeat(1,minmax(0,1fr));gap:2rem">
        <div style="display:grid;grid-template-columns:repeat(1,minmax(0,1fr));gap:2rem" class="lg:grid-cols-3">
          
          <!-- COLUMNA IZQUIERDA: DATOS DEL PROYECTO -->
          <div class="lg:col-span-1" style="display:flex;flex-direction:column;gap:1.5rem">
            <div style="background:var(--card-bg,#fff);border-radius:1rem;box-shadow:0 1px 2px rgba(0,0,0,.05);border:1px solid var(--border,#e5e7eb);overflow:hidden;position:sticky;top:2rem">
              <div style="padding:1.5rem;border-bottom:1px solid var(--border,#f3f4f6);background:rgba(249, 250, 251, 0.5)">
                <h3 style="font-size:.75rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.5rem">Proyecto</h3>
                <h1 style="font-size:1.25rem;font-weight:700;color:var(--text-primary);line-height:1.25;margin:0">{{ proyecto.nombre }}</h1>
              </div>
              
              <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1.5rem">
                <div>
                  <h4 style="font-size:.75rem;font-weight:700;color:#6b7280;text-transform:uppercase;margin-bottom:.5rem">Descripción</h4>
                  <p style="font-size:.875rem;color:#4b5563;line-height:1.6;margin:0">
                    {{ proyecto.descripcion || 'Sin descripción registrada.' }}
                  </p>
                </div>

                <div style="padding-top:1rem;border-top:1px solid var(--border,#f3f4f6)">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
                    <span style="font-size:.75rem;font-weight:700;color:#6b7280;text-transform:uppercase">Equipo</span>
                    <span v-if="proyecto.equipo" style="font-size:.75rem;background:#e0e7ff;color:#4338ca;padding:.25rem .5rem;border-radius:.25rem;font-weight:700">
                      {{ countMembers(proyecto.equipo) }} Miembros
                    </span>
                  </div>
                  <div style="display:flex;align-items:center;gap:.75rem">
                    <div style="width:2.5rem;height:2.5rem;border-radius:9999px;background:linear-gradient(to bottom right, #a855f7, #4f46e5);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:.875rem;box-shadow:0 1px 2px rgba(0,0,0,0.05)">
                      {{ (proyecto.equipo?.nombre || 'S').charAt(0).toUpperCase() }}
                    </div>
                    <p style="font-size:.875rem;font-weight:700;color:var(--text-primary);margin:0">
                      {{ proyecto.equipo?.nombre || 'Sin Equipo Asignado' }}
                    </p>
                  </div>
                </div>

                <div v-if="proyecto.repositorio_url" style="padding-top:1rem;border-top:1px solid var(--border,#f3f4f6)">
                  <a :href="proyecto.repositorio_url" target="_blank" style="display:flex;align-items:center;justify-content:center;width:100%;padding:.625rem;background:#f3f4f6;color:#374151;border-radius:.75rem;font-size:.875rem;font-weight:700;text-decoration:none;gap:.5rem;transition:background 0.2s" class="hover:bg-gray-200">
                    <svg style="width:1.25rem;height:1.25rem" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    Ver Repositorio
                  </a>
                </div>

                <div style="padding-top:.5rem">
                  <router-link :to="`/admin/proyectos/${route.params.id}/editar`" style="display:flex;align-items:center;justify-content:center;width:100%;padding:.625rem;border:2px dashed #d1d5db;color:#6b7280;border-radius:.75rem;font-size:.875rem;font-weight:700;text-decoration:none;transition:all 0.2s" class="hover:text-indigo-600 hover:border-indigo-500">
                    Editar Información
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- COLUMNA DERECHA: RESULTADOS -->
          <div class="lg:col-span-2" style="display:flex;flex-direction:column;gap:1.5rem">
            
            <!-- KPI RESULTADO FINAL -->
            <div style="background:var(--card-bg,#fff);border-radius:1rem;box-shadow:0 1px 2px rgba(0,0,0,.05);border:1px solid var(--border,#e5e7eb);overflow:hidden">
              <div style="padding:1.5rem;display:flex;justify-content:space-between;align-items:center;background:#4f46e5;color:white;position:relative;overflow:hidden" class="flex-col md:flex-row">
                <div style="position:absolute;inset:0;background-image:url('https://www.transparenttextures.com/patterns/cubes.png');opacity:0.1"></div>
                
                <div style="position:relative;z-index:10;width:100%">
                  <h3 style="font-size:1.125rem;font-weight:700;opacity:0.9;margin:0">Calificación Final</h3>
                  <p style="font-size:.75rem;opacity:0.75;margin:.25rem 0 0">Promedio ponderado de todas las evaluaciones.</p>
                </div>
                
                <div style="position:relative;z-index:10;display:flex;align-items:center;gap:0.35rem">
                  <span style="font-size:2.25rem;font-weight:800;letter-spacing:-0.02em">{{ puntajeTotal }}</span>
                  <span style="font-size:1.5rem;font-weight:300;opacity:0.4;margin:0 0.125rem">/</span>
                  <span style="font-size:1.125rem;font-weight:700;opacity:0.8;padding-top:0.25rem">100</span>
                </div>
              </div>

              <div style="padding:1.5rem">
                <div v-if="desglosePuntaje.length > 0">
                  <div style="overflow:hidden;border-radius:.75rem;border:1px solid var(--border,#e5e7eb)">
                    <table style="width:100%;border-collapse:collapse;text-align:left">
                      <thead style="background:#f9fafb;border-bottom:1px solid var(--border,#e5e7eb);">
                        <tr>
                          <th style="padding:.75rem 1.5rem;font-size:.75rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Criterio</th>
                          <th style="padding:.75rem 1.5rem;font-size:.75rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;text-align:center">Peso</th>
                          <th style="padding:.75rem 1.5rem;font-size:.75rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;text-align:center">Promedio Jueces</th>
                          <th style="padding:.75rem 1.5rem;font-size:.75rem;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;text-align:right">Puntos Reales</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(fila, idx) in desglosePuntaje" :key="idx" class="hover:bg-gray-50" style="border-bottom:1px solid var(--border,#f3f4f6)">
                          <td style="padding:1rem 1.5rem;font-size:.875rem;font-weight:500;color:var(--text-primary)">
                            {{ fila.criterio }}
                          </td>
                          <td style="padding:1rem 1.5rem;text-align:center">
                            <span style="display:inline-flex;align-items:center;padding:.125rem .5rem;border-radius:.25rem;font-size:.75rem;font-weight:500;background:#f3f4f6;color:#374151">
                              {{ fila.ponderacion }}%
                            </span>
                          </td>
                          <td style="padding:1rem 1.5rem;text-align:center;font-size:.875rem;font-weight:700;color:#2563eb">
                            {{ fila.promedio_jueces }}
                          </td>
                          <td style="padding:1rem 1.5rem;text-align:right;font-size:.875rem;font-weight:900;color:var(--text-primary)">
                            {{ fila.puntos_reales }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div style="margin-top:1rem;padding:1rem;background:#fefce8;border:1px solid #fef08a;border-radius:.75rem;display:flex;gap:.75rem">
                    <svg style="width:1.25rem;height:1.25rem;color:#ca8a04;flex-shrink:0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p style="font-size:.75rem;color:#a16207;margin:0;line-height:1.5">
                      <strong>¿Cómo se calcula?</strong> El "Promedio Jueces" es la calificación media (0-100) otorgada por todos los evaluadores en ese criterio. Los "Puntos Reales" son el resultado de aplicar la ponderación (Peso) a ese promedio.
                    </p>
                  </div>
                </div>
                
                <div v-else style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 0">
                  <div style="width:4rem;height:4rem;background:#f3f4f6;border-radius:9999px;display:flex;align-items:center;justify-content:center;margin-bottom:1rem">
                    <svg style="width:2rem;height:2rem;color:#9ca3af" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <h3 style="color:var(--text-primary);font-weight:700;margin:0">Sin Evaluaciones</h3>
                  <p style="color:#6b7280;font-size:.875rem;margin:.25rem 0 0">Este proyecto aún no ha sido calificado por los jueces.</p>
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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../plugins/axios'
import alerts from '../../services/alerts'

const route = useRoute()
const proyecto = ref(null)
const loading = ref(true)

const desglosePuntaje = ref([])
const puntajeTotal = ref('0.0')

onMounted(async () => {
  const id = route.params.id
  try {
    const r = await api.get(`/admin/proyectos/${id}`)
    proyecto.value = r.data.data
    calcularPuntaje()
  } catch (e) {
    console.error(e)
    alerts.error('Error al cargar proyecto.')
  } finally {
    loading.value = false
  }
})

function countMembers(equipo) {
  if (!equipo) return 0
  if (equipo.equipo_miembros) return equipo.equipo_miembros.length
  return 0
}

function calcularPuntaje() {
  if (!proyecto.value || !proyecto.value.evaluaciones || proyecto.value.evaluaciones.length === 0) {
    return
  }

  const desglose_map = {}
  
  // Aggregate sum of ratings and counts per criterion
  proyecto.value.evaluaciones.forEach(ev => {
    if (!ev.criterio_id || !ev.criterio) return // fallback if no join data
    
    if (!desglose_map[ev.criterio_id]) {
      desglose_map[ev.criterio_id] = {
        criterio: ev.criterio.nombre || 'Criterio Desconocido',
        ponderacion: ev.criterio.ponderacion || 0,
        sum: 0,
        count: 0
      }
    }
    desglose_map[ev.criterio_id].sum += typeof ev.puntuacion === 'string' ? parseFloat(ev.puntuacion) : ev.puntuacion
    desglose_map[ev.criterio_id].count += 1
  })

  // Format array and compute final score
  let total = 0
  desglosePuntaje.value = Object.values(desglose_map).map(d => {
    const promedio = parseFloat(d.sum) / d.count
    const ptsReales = (promedio * parseFloat(d.ponderacion)) / 100
    total += ptsReales
    return {
      criterio: d.criterio,
      ponderacion: parseFloat(d.ponderacion).toFixed(0),
      promedio_jueces: promedio.toFixed(2),
      puntos_reales: ptsReales.toFixed(2)
    }
  })

  puntajeTotal.value = total.toFixed(1)
}
</script>

<style scoped>
@media (min-width: 768px) {
  .md\:flex-row { flex-direction: row; }
  .md\:margin-top-0 { margin-top: 0 !important; }
}
@media (min-width: 1024px) {
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  .lg\:col-span-1 { grid-column: span 1 / span 1 !important; }
  .lg\:col-span-2 { grid-column: span 2 / span 2 !important; }
}
</style>
