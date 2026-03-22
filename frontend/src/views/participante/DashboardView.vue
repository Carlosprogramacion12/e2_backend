<template>
  <AppLayout>
    <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:1.5rem">Mi Dashboard</h2>
    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <template v-else>
      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-top"><div><p class="stat-label">Mi Equipo</p><h4 class="stat-value">{{ data.equipo?.nombre || '—' }}</h4></div>
            <div class="stat-icon blue"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-top"><div><p class="stat-label">Proyecto</p><h4 class="stat-value">{{ data.proyecto?.nombre || '—' }}</h4></div>
            <div class="stat-icon emerald"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg></div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-top"><div><p class="stat-label">Invitaciones</p><h4 class="stat-value">{{ data.invitaciones?.length || 0 }}</h4></div>
            <div class="stat-icon purple"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div>
          </div>
        </div>
      </div>

      <!-- Invitaciones Pendientes -->
      <div v-if="data.invitaciones?.length" class="card" style="margin-bottom:1.5rem">
        <div class="card-header">📩 Invitaciones Pendientes</div>
        <div class="card-body">
          <div v-for="inv in data.invitaciones" :key="inv.id" style="display:flex;align-items:center;justify-content:space-between;padding:.75rem 0;border-bottom:1px solid #f3f4f6">
            <div><p style="font-weight:500">{{ inv.equipo?.nombre || 'Equipo' }}</p><p style="font-size:.75rem;color:#9ca3af">Rol: {{ inv.rol }}</p></div>
            <div style="display:flex;gap:.5rem">
              <button class="btn btn-sm btn-indigo" @click="respondInvite(inv.id,'aceptada')">Aceptar</button>
              <button class="btn btn-sm btn-outline" @click="respondInvite(inv.id,'rechazada')">Rechazar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Eventos Activos -->
      <div v-if="data.eventos?.length" class="card" style="margin-bottom:1.5rem">
        <div class="card-header">📅 Eventos Activos</div>
        <div class="card-body">
          <div v-for="e in data.eventos" :key="e.id" class="event-item">
            <div class="event-date-box"><span class="month">{{ getMon(e.fecha_inicio) }}</span><span class="day">{{ getDay(e.fecha_inicio) }}</span></div>
            <div><h4 style="font-weight:700;font-size:.875rem">{{ e.nombre }}</h4><p style="font-size:.75rem;color:#6b7280">{{ e.descripcion || '' }}</p></div>
          </div>
        </div>
      </div>

      <!-- Registro Inicial CTA -->
      <div v-if="!data.registrado" class="card" style="margin-bottom:1.5rem">
        <div class="card-body" style="text-align:center;padding:2.5rem">
          <div style="font-size:3rem;margin-bottom:1rem">📝</div>
          <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:.5rem">Completa tu registro</h3>
          <p style="color:#6b7280;margin-bottom:1.5rem">Debes completar tu perfil de participante antes de unirte a un equipo.</p>
          <router-link to="/participante/registro" class="btn btn-indigo">Completar Registro</router-link>
        </div>
      </div>
    </template>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import api from '../../services/api'
const data = ref({}); const loading = ref(true)
const getMon = d => d ? new Date(d).toLocaleDateString('es-MX',{month:'short'}).toUpperCase() : ''
const getDay = d => d ? new Date(d).getDate() : ''
async function respondInvite(id, estado) { try { await api.post(`/participante/invitaciones/${id}/responder`, { estado }); fetchData() } catch(e){} }
async function fetchData() { try { const r = await api.get('/participante/dashboard'); data.value = r.data.data } catch(e){} finally { loading.value = false } }
onMounted(fetchData)
</script>
