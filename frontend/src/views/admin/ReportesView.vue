<template>
  <AppLayout>
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else class="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <!-- Encabezado -->
      <div style="margin-bottom: 2rem">
        <h2
          style="
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
          "
        >
          Generación de Reportes
        </h2>
        <p style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.75rem">
          Descarga reportes en formato PDF con todos los datos del sistema
        </p>
      </div>

      <!-- Grid de Tarjetas de Reportes -->
      <div class="reports-grid">
        <!-- Reporte de Usuarios -->
        <div class="report-card">
          <div class="report-card-top">
            <div class="report-icon-box indigo">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
            </div>
            <span class="report-stat-value">{{
              stats.totalUsuarios || 0
            }}</span>
          </div>
          <h3 class="report-title">Usuarios</h3>
          <p class="report-desc">
            Listado completo de usuarios con roles y datos
          </p>
          <button
            @click="downloadPdf('usuarios')"
            class="btn-report btn-indigo"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            Descargar PDF
          </button>
        </div>

        <!-- Reporte de Equipos -->
        <div class="report-card">
          <div class="report-card-top">
            <div class="report-icon-box blue">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
            <span class="report-stat-value">{{ stats.totalEquipos || 0 }}</span>
          </div>
          <h3 class="report-title">Equipos</h3>
          <p class="report-desc">
            Equipos con integrantes y proyectos asignados
          </p>
          <button @click="downloadPdf('equipos')" class="btn-report btn-blue">
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            Descargar PDF
          </button>
        </div>

        <!-- Reporte de Eventos -->
        <div class="report-card">
          <div class="report-card-top">
            <div class="report-icon-box purple">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
            <span class="report-stat-value">{{ stats.totalEventos || 0 }}</span>
          </div>
          <h3 class="report-title">Eventos</h3>
          <p class="report-desc">Eventos con fechas, criterios y proyectos</p>
          <button @click="downloadPdf('eventos')" class="btn-report btn-purple">
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            Descargar PDF
          </button>
        </div>

        <!-- Reporte de Proyectos -->
        <div class="report-card">
          <div class="report-card-top">
            <div class="report-icon-box emerald">
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                ></path>
              </svg>
            </div>
            <span class="report-stat-value">{{
              stats.totalProyectos || 0
            }}</span>
          </div>
          <h3 class="report-title">Proyectos</h3>
          <p class="report-desc">Proyectos con equipos y calificaciones</p>
          <button
            @click="downloadPdf('proyectos')"
            class="btn-report btn-emerald"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AppLayout from "../../components/layout/AppLayout.vue";
import api from "../../plugins/axios";
import alerts from "../../services/alerts";

const stats = ref({});
const loading = ref(true);

async function fetchStats() {
  try {
    const { data } = await api.get("/admin/reportes");
    stats.value = data.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

async function downloadPdf(type) {
  try {
    const response = await api.get(`/admin/reportes/${type}/pdf`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" }),
    );
    
    // Abrir en nueva pestaña
    window.open(url, '_blank');
    
    // Limpieza opcional tras un tiempo (para dar tiempo al navegador a cargar)
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    console.error(error);
    alerts.error("Error al generar el reporte PDF");
  }
}

onMounted(fetchStats);
</script>

<style scoped>
.reports-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .reports-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .reports-grid { grid-template-columns: repeat(4, 1fr); }
}

.report-card {
  padding: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* Softer initial shadow */
  display: flex;
  flex-direction: column;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.report-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.15);
  /* The original border remains, no extra color added */
}

.report-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.report-icon-box {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.report-icon-box.indigo {
  background: #eef2ff;
  color: #4f46e5;
}
.report-icon-box.blue {
  background: #eff6ff;
  color: #2563eb;
}
.report-icon-box.purple {
  background: #f5f3ff;
  color: #7c3aed;
}
.report-icon-box.emerald {
  background: #ecfdf5;
  color: #10b981;
}

.report-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.report-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.report-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.btn-report {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-indigo {
  background: #4f46e5;
}
.btn-indigo:hover {
  background: #4338ca;
}

.btn-blue {
  background: #2563eb;
}
.btn-blue:hover {
  background: #1d4ed8;
}

.btn-purple {
  background: #7c3aed;
}
.btn-purple:hover {
  background: #6d28d9;
}

.btn-emerald {
  background: #10b981;
}
.btn-emerald:hover {
  background: #059669;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 20rem;
}
</style>
